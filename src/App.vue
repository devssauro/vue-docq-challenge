<template>
  <v-app id="inspire">
    <v-navigation-drawer v-model="drawer">
      <v-container>
        <v-row>
          <v-col cols="12">
            <v-dialog width="500" v-model="dialog">
              <template v-slot:activator="{ props }">
                <v-btn block v-bind="props" variant="tonal">
                  add image
                </v-btn>
              </template>

              <template v-slot:default="{ isActive }">
                <v-card title="Dialog">
                  <v-card-text>
                    <v-file-input
                      v-model="newImage"
                      accept="image/*"
                      placeholder="Pick an image"
                      prepend-icon="mdi-camera"
                      label="Image" />
                  </v-card-text>

                  <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn
                      text="Cancel"
                      @click="isActive.value = false" />
                    <v-btn
                      text="Upload"
                      @click="uploadImage()"
                      :loading="loadingUpload"
                    ></v-btn>
                  </v-card-actions>
                </v-card>
              </template>
            </v-dialog>
          </v-col>
          <v-col v-for="image in images" :key="image.id" cols="12">
            <v-card @click="selectImage(image.id)" variant="outlined">
              <v-img 
                :alt="image.text"
                :src="image.src" />
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
        clearable 
        density="compact"
        single-line
        label="Search" 
        variant="solo" />
    </v-app-bar>

    <v-main fill-heigth>
      <v-container>
        <v-row>
          <v-col cols="6">
            <v-card-text>
              <v-img :max-height="300" v-if="this.selectedImg !== null" :src="getSelectedImageSrc()" />
              {{ getSelectedImageText() }}
            </v-card-text>
          </v-col>
        </v-row>
      </v-container>
    </v-main>
  </v-app>
</template>

<script>
  import { ref, defineComponent } from 'vue'
  import { createWorker } from 'tesseract.js';
  import axios from 'axios'
  import FormData from "form-data"

  const drawer = ref(null)

  export default defineComponent({
    name: "app",
    data: () => ({ 
      search: "",
      newImage: null,
      newImageText: '',
      dialog: false,
      drawer: null,
      images: [],
      selectedImg: null,
      loadingUpload: false,
      selectedWordCount: 0,
      selectedWordFrequency: {},
    }),
    methods: {
      getImages() {
        axios.get(`http://localhost:5010/all`, {params: {query: this.search}}).then((response) => {
          this.images = response.data;
        });
      },
      uploadImage() {
        this.loadingUpload = true;
        (async () => {
          let fd = new FormData();
          fd.set("img", this.newImage[0]);
          console.log("starting")
          const worker = await createWorker('eng+pt_pt');
          const { data: { text } } = await worker.recognize(this.newImage[0]);
          fd.set("text_data", text.replace(/\n/g, " "));
          await worker.terminate();
          this.loadingUpload = false;
          axios.post("http://localhost:5010/upload", fd, {
            headers: {"Content-Type": "multipart/form-data"}
          }).then((res) => {
            this.getImages()
          });
          this.dialog = false;
        })();
      },
      selectImage(imageId) {
        this.selectedImg = imageId;
      },
      getSelectedImageSrc() {
        if (this.selectedImg !== null)
          return this.images.filter(img => img.id === this.selectedImg)[0].src;
      },
      getSelectedImageText() {
        if (this.selectedImg !== null)
          return this.images.filter(img => img.id === this.selectedImg)[0].text;
      }
    },
    created() {
      this.getImages();
    }
  })
</script>