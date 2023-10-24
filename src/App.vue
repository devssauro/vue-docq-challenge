<template>
  <v-app id="inspire">
    <v-navigation-drawer v-model="drawer">
      <v-container>
        <v-row>
          <v-col cols="12">
            <v-dialog width="500">
              <template v-slot:activator="{ props }">
                <v-btn block v-bind="props" variant="tonal">
                  add image
                </v-btn>
              </template>

              <template v-slot:default="{ isActive }">
                <v-card title="Dialog">
                  <v-card-text>
                    <v-file-input
                      accept="image/png, image/jpeg, image/bmp"
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
                      @click="isActive.value = false"
                    ></v-btn>
                  </v-card-actions>
                </v-card>
              </template>
            </v-dialog>
          </v-col>
          <v-col v-for="image in images" :key="image.id">
            <v-img 
              :alt="image.text"
              :src="image.src"
              @click="selectImage(image.id)"/>
          </v-col>
        </v-row>
      </v-container>
    </v-navigation-drawer>

    <v-app-bar>
      <v-app-bar-nav-icon @click="drawer = !drawer"></v-app-bar-nav-icon>

      <v-app-bar-title>Image reader</v-app-bar-title>
    </v-app-bar>

    <v-main>
      <v-container>
        <v-row>
          <v-col cols="12">
            <v-card title="Here goes the statuses, charts and other stuff." />
          </v-col>
          <v-col cols="12">
            <v-img v-if="this.selectedImg !== null" :src="getSelectedImageSrc()" />
          </v-col>
        </v-row>
      </v-container>
    </v-main>
  </v-app>
</template>

<script>
  import { ref, defineComponent } from 'vue'
  import axios from 'axios'

  const drawer = ref(null)

  export default defineComponent({
    name: "app",
    data: () => ({ 
      drawer: null,
      images: [],
      selectedImg: null,
    }),
    methods: {
      getImages() {
        axios.get("http://localhost:5010/all").then((response) => {
          this.images = response.data;
        });
      },
      selectImage(imageId) {
        this.selectedImg = imageId;
      },
      getSelectedImageSrc() {
        return this.images.filter(img => img.id === this.selectedImg)[0].src;
      }
    },
    created() {
      this.getImages();
    }
  })
</script>