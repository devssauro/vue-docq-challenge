<template>
  <v-app id="inspire">
    <v-navigation-drawer v-model="drawer">
      <v-container>
        <v-row>
          <v-col cols="12">
            <v-dialog width="500" v-model="dialog" id="upload-image-card">
              <template v-slot:activator="{ props }">
                <v-btn block v-bind="props" variant="tonal" id="add-image-btn">
                  add image
                </v-btn>
              </template>

              <template v-slot:default="{ isActive }">
                <v-card title="Submit new image">
                  <v-card-text>
                    <v-file-input
                      v-model="newImage"
                      accept="image/*"
                      placeholder="Pick an image"
                      prepend-icon="mdi-camera"
                      label="Image"
                    />
                  </v-card-text>

                  <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn text="Cancel" @click="isActive.value = false" />
                    <v-btn
                      text="Upload"
                      @click="uploadImage"
                      :loading="loadingUpload"
                    ></v-btn>
                  </v-card-actions>
                </v-card>
              </template>
            </v-dialog>
          </v-col>
          <v-col v-for="image in images" :key="image.id" cols="12">
            <v-card @click="selectImage(image)" variant="outlined">
              <v-img :alt="image.text" :src="image.src" />
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </v-navigation-drawer>

    <v-app-bar color="primary">
      <v-app-bar-nav-icon @click="drawer = !drawer"></v-app-bar-nav-icon>

      <v-app-bar-title>Image reader</v-app-bar-title>
      <v-spacer></v-spacer>
      <v-text-field
        class="pt-5 pr-2"
        v-model="search"
        @change="getImages"
        density="compact"
        single-line
        label="Search"
        variant="solo"
      />
    </v-app-bar>

    <v-main fill-heigth>
      <v-container>
        <v-row v-if="selectedImg !== null">
          <v-col cols="6">
            <v-card-text>
              <v-img
                :max-height="300"
                v-if="selectedImg !== null"
                :src="selectedImg.src"
              />
              {{ selectedImg.text }}
            </v-card-text>
          </v-col>
          <v-col cols="6">
            <v-card :title="`Total of words: ${totalWords}`" class="mb-2">
            </v-card>
            <v-card title="Most frequent words" class="px-4 pb-4">
              <BarChart :chartData="wordFreqData" :options="barOptions" />
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </v-main>
  </v-app>
</template>

<script>
import { ref, defineComponent } from "vue";
import { createWorker } from "tesseract.js";
import axios from "axios";
import FormData from "form-data";
import { BarChart } from "vue-chart-3";
import { Chart, registerables } from "chart.js";
Chart.register(...registerables);

const drawer = ref(null);

export default defineComponent({
  name: "app",
  components: { BarChart },
  setup() {
    const selectedImg = ref(null);
    const images = ref([]);

    return {
      images,
      selectedImg,
    };
  },
  data: () => ({
    dialog: false,
    drawer: null,
    loadingUpload: false,
    newImage: null,
    newImageText: "",
    search: "",
    selectedWordCount: 0,
    selectedWordFrequency: {},
    totalWords: null,
    barOptions: {
      plugins: {
        legend: {
          display: false,
        },
      },
    },
    wordFreqData: {
      labels: [],
      datasets: [
        {
          data: [],
        },
      ],
    },
  }),
  methods: {
    getImages() {
      axios
        .get(`http://localhost:5010/all`, { params: { query: this.search } })
        .then((response) => {
          this.images = JSON.parse(JSON.stringify(response.data));
        });
    },
    getMostFrequentWords() {
      axios
        .get(`http://localhost:5010/${this.selectedImg.id}/words/occurencies`, {
          params: { query: this.search },
        })
        .then((response) => {
          this.wordFreqData = response.data;
        });
    },
    getTotalWords() {
      axios
        .get(`http://localhost:5010/${this.selectedImg.id}/words/total`, {
          params: { query: this.search },
        })
        .then((response) => {
          this.totalWords = response.data.total_words;
        });
    },
    async uploadImage() {
      this.loadingUpload = true;
      let fd = new FormData();
      fd.set("img", this.newImage[0]);
      console.log("starting");
      const worker = await createWorker("eng");
      const {
        data: { text },
      } = await worker.recognize(this.newImage[0]);
      fd.set("text_data", text.replace(/\n/g, " "));
      await worker.terminate();
      this.loadingUpload = false;
      axios
        .post("http://localhost:5010/upload", fd, {
          headers: { "Content-Type": "multipart/form-data" },
        })
        .then((res) => {
          this.getImages();
          this.selectedImg = res.data;
          this.selectImage(this.selectedImg);
        });
      this.dialog = false;
    },
    selectImage(image) {
      this.selectedImg = image;
      this.getMostFrequentWords();
      this.getTotalWords();
    },
  },
  created() {
    this.getImages();
  },
});
</script>
