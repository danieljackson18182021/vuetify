<template>
  <div>
    <v-row justify="space-around">
      <v-switch
        v-model="dense"
        label="Dense"
      ></v-switch>
      <v-switch
        v-model="selectable"
        label="Selectable"
      ></v-switch>
      <v-switch
        v-model="activatable"
        label="Activatable"
      ></v-switch>
      <v-switch
        v-model="hoverable"
        label="Hoverable"
      ></v-switch>
      <v-switch
        v-model="shaped"
        label="Shaped"
      ></v-switch>
      <v-switch
        v-model="rounded"
        label="Rounded"
      ></v-switch>
      <v-switch
        v-model="openOnClick"
        label="Open on any item click"
      ></v-switch>
      <v-col cols="12">
        <v-select
          v-model="selectedColor"
          :disabled="!selectable"
          :items="selectedColors"
          label="Selected checkbox color"
        ></v-select>
      </v-col>
      <v-col cols="12">
        <v-select
          v-model="color"
          :disabled="!activatable"
          :items="selectedColors"
          label="Active node color"
        ></v-select>
      </v-col>
    </v-row>

    <v-treeview
      :activatable="activatable"
      :color="color"
      :dense="dense"
      :hoverable="hoverable"
      :items="items"
      :open-on-click="openOnClick"
      :rounded="rounded"
      :selectable="selectable"
      :selected-color="selectedColor"
      :shaped="shaped"
      item-title="name"
      item-value="id"
    ></v-treeview>
  </div>
</template>

<script setup>
  import { ref } from 'vue'

  const items = ref([
    {
      id: 1,
      name: 'Applications :',
      children: [
        { id: 2, name: 'Calendar : app' },
        { id: 3, name: 'Chrome : app' },
        { id: 4, name: 'Webstorm : app' },
      ],
    },
    {
      id: 5,
      name: 'Documents :',
      children: [
        {
          id: 6,
          name: 'vuetify :',
          children: [
            {
              id: 7,
              name: 'src :',
              children: [
                { id: 8, name: 'index : ts' },
                { id: 9, name: 'bootstrap : ts' },
              ],
            },
          ],
        },
        {
          id: 10,
          name: 'material2 :',
          children: [
            {
              id: 11,
              name: 'src :',
              children: [
                { id: 12, name: 'v-btn : ts' },
                { id: 13, name: 'v-card : ts' },
                { id: 14, name: 'v-window : ts' },
              ],
            },
          ],
        },
      ],
    },
    {
      id: 15,
      name: 'Downloads :',
      children: [
        { id: 16, name: 'October : pdf' },
        { id: 17, name: 'November : pdf' },
        { id: 18, name: 'Tutorial : html' },
      ],
    },
    {
      id: 19,
      name: 'Videos :',
      children: [
        {
          id: 20,
          name: 'Tutorials :',
          children: [
            { id: 21, name: 'Basic layouts : mp4' },
            { id: 22, name: 'Advanced techniques : mp4' },
            { id: 23, name: 'All about app : dir' },
          ],
        },
        { id: 24, name: 'Intro : mov' },
        { id: 25, name: 'Conference introduction : avi' },
      ],
    },
  ])
  const dense = ref(false)
  const selectable = ref(false)
  const activatable = ref(false)
  const hoverable = ref(false)
  const openOnClick = ref(false)
  const shaped = ref(false)
  const rounded = ref(false)
  const color = ref('primary')
  const selectedColor = ref('accent')
  const selectedColors = ref([
    'accent',
    'teal',
    'red',
    'success',
    'warning lighten-2',
  ])
</script>

<script>
  export default {
    data: () => ({
      items: [
        {
          id: 1,
          name: 'Applications :',
          children: [
            { id: 2, name: 'Calendar : app' },
            { id: 3, name: 'Chrome : app' },
            { id: 4, name: 'Webstorm : app' },
          ],
        },
        {
          id: 5,
          name: 'Documents :',
          children: [
            {
              id: 6,
              name: 'vuetify :',
              children: [
                {
                  id: 7,
                  name: 'src :',
                  children: [
                    { id: 8, name: 'index : ts' },
                    { id: 9, name: 'bootstrap : ts' },
                  ],
                },
              ],
            },
            {
              id: 10,
              name: 'material2 :',
              children: [
                {
                  id: 11,
                  name: 'src :',
                  children: [
                    { id: 12, name: 'v-btn : ts' },
                    { id: 13, name: 'v-card : ts' },
                    { id: 14, name: 'v-window : ts' },
                  ],
                },
              ],
            },
          ],
        },
        {
          id: 15,
          name: 'Downloads :',
          children: [
            { id: 16, name: 'October : pdf' },
            { id: 17, name: 'November : pdf' },
            { id: 18, name: 'Tutorial : html' },
          ],
        },
        {
          id: 19,
          name: 'Videos :',
          children: [
            {
              id: 20,
              name: 'Tutorials :',
              children: [
                { id: 21, name: 'Basic layouts : mp4' },
                { id: 22, name: 'Advanced techniques : mp4' },
                { id: 23, name: 'All about app : dir' },
              ],
            },
            { id: 24, name: 'Intro : mov' },
            { id: 25, name: 'Conference introduction : avi' },
          ],
        },
      ],
      dense: false,
      selectable: false,
      activatable: false,
      hoverable: false,
      openOnClick: false,
      shaped: false,
      rounded: false,
      color: 'primary',
      selectedColor: 'accent',
      selectedColors: [
        'accent',
        'teal',
        'red',
        'success',
        'warning lighten-2',
      ],
    }),
  }
</script>
