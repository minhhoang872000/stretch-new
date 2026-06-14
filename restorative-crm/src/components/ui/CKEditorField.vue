<template>
  <div class="ck-editor-wrapper" :class="{ 'ck-editor-wrapper--error': error }">
    <ckeditor
      v-if="editorReady"
      :editor="ClassicEditor"
      v-model="localValue"
      :config="editorConfig"
      @ready="onReady"
    />
    <p v-if="error" class="text-error text-xs mt-1">{{ error }}</p>
  </div>
</template>

<script setup>
import { ref, watch, shallowRef } from 'vue'
import { Ckeditor } from '@ckeditor/ckeditor5-vue'
import { uploadImage } from '@/services/api'

import {
  ClassicEditor,
  Essentials,
  Paragraph,
  Autoformat,
  TextTransformation,
  Heading,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Code,
  Subscript,
  Superscript,
  RemoveFormat,
  FontSize,
  FontFamily,
  FontColor,
  FontBackgroundColor,
  Highlight,
  List,
  ListProperties,
  TodoList,
  Indent,
  IndentBlock,
  BlockQuote,
  CodeBlock,
  HorizontalLine,
  PageBreak,
  Alignment,
  Link,
  LinkImage,
  AutoLink,
  Image,
  ImageCaption,
  ImageStyle,
  ImageToolbar,
  ImageResize,
  ImageInsert,
  ImageUpload,
  AutoImage,
  Table,
  TableToolbar,
  TableProperties,
  TableCellProperties,
  TableColumnResize,
  TableCaption,
  MediaEmbed,
  GeneralHtmlSupport,
  FindAndReplace,
  SourceEditing,
  SpecialCharacters,
  SpecialCharactersEssentials,
  ShowBlocks,
  WordCount,
} from 'ckeditor5'

import 'ckeditor5/ckeditor5.css'

function CloudflareUploadAdapterPlugin(editor) {
  editor.plugins.get('FileRepository').createUploadAdapter = (loader) => ({
    async upload() {
      const file = await loader.file
      const { url } = await uploadImage(file)
      return { default: url }
    },
    abort() {},
  })
}

const props = defineProps({
  modelValue: { type: String, default: '' },
  placeholder: { type: String, default: 'Viết nội dung bài viết tại đây…' },
  error: { type: String, default: '' },
})

const emit = defineEmits(['update:modelValue'])

const editorReady = ref(true)
const localValue = ref(props.modelValue)

watch(() => props.modelValue, (val) => {
  if (val !== localValue.value) localValue.value = val
})

watch(localValue, (val) => {
  emit('update:modelValue', val)
})

function onReady(editor) {
  // editor instance available here if needed
}

const editorConfig = {
  licenseKey: 'GPL',
  placeholder: props.placeholder,
  plugins: [
    Essentials, Paragraph, Autoformat, TextTransformation,
    Heading,
    Bold, Italic, Underline, Strikethrough, Code,
    Subscript, Superscript, RemoveFormat,
    FontSize, FontFamily, FontColor, FontBackgroundColor, Highlight,
    List, ListProperties, TodoList, Indent, IndentBlock,
    BlockQuote, CodeBlock, HorizontalLine, PageBreak, Alignment,
    Link, LinkImage, AutoLink,
    Image, ImageCaption, ImageStyle, ImageToolbar,
    ImageResize, ImageInsert, ImageUpload, AutoImage,
    Table, TableToolbar, TableProperties, TableCellProperties,
    TableColumnResize, TableCaption,
    MediaEmbed, GeneralHtmlSupport,
    FindAndReplace, SourceEditing,
    SpecialCharacters, SpecialCharactersEssentials,
    ShowBlocks, WordCount,
  ],
  extraPlugins: [CloudflareUploadAdapterPlugin],
  toolbar: {
    items: [
      'undo', 'redo', '|',
      'sourceEditing', 'showBlocks', 'findAndReplace', '|',
      'heading', '|',
      'fontSize', 'fontFamily', 'fontColor', 'fontBackgroundColor', 'highlight', '|',
      'bold', 'italic', 'underline', 'strikethrough', 'subscript', 'superscript',
      'code', 'removeFormat', '|',
      'specialCharacters', 'horizontalLine', 'pageBreak', '|',
      'link', 'insertImage', 'mediaEmbed', 'insertTable',
      'blockQuote', 'codeBlock', '|',
      'alignment', '|',
      'bulletedList', 'numberedList', 'todoList', 'outdent', 'indent',
    ],
    // Group overflowing items into a dropdown instead of forcing one wide row.
    // Essential on mobile so the toolbar fits the viewport instead of overflowing.
    shouldNotGroupWhenFull: false,
  },
  heading: {
    options: [
      { model: 'paragraph', title: 'Paragraph', class: 'ck-heading_paragraph' },
      { model: 'heading1', view: 'h1', title: 'Heading 1', class: 'ck-heading_heading1' },
      { model: 'heading2', view: 'h2', title: 'Heading 2', class: 'ck-heading_heading2' },
      { model: 'heading3', view: 'h3', title: 'Heading 3', class: 'ck-heading_heading3' },
      { model: 'heading4', view: 'h4', title: 'Heading 4', class: 'ck-heading_heading4' },
    ],
  },
  image: {
    toolbar: [
      'imageStyle:inline', 'imageStyle:block', 'imageStyle:side', '|',
      'toggleImageCaption', 'imageTextAlternative', '|', 'resizeImage',
    ],
  },
  table: {
    contentToolbar: [
      'tableColumn', 'tableRow', 'mergeTableCells',
      'tableProperties', 'tableCellProperties',
    ],
  },
  link: {
    defaultProtocol: 'https://',
    addTargetToExternalLinks: true,
  },
  list: {
    properties: { styles: true, startIndex: true, reversed: true },
  },
  htmlSupport: {
    allow: [{ name: /.*/, attributes: true, classes: true, styles: true }],
  },
}
</script>

<style>
.ck-editor-wrapper .ck-editor__editable {
  min-height: 320px;
  font-family: 'Manrope', sans-serif !important;
  font-size: 0.9rem;
  line-height: 1.7;
  color: #191c1c;
  border-bottom-left-radius: 0.75rem !important;
  border-bottom-right-radius: 0.75rem !important;
}
.ck-editor-wrapper .ck.ck-toolbar {
  border-top-left-radius: 0.75rem !important;
  border-top-right-radius: 0.75rem !important;
  background: #f2f4f3 !important;
  border-color: rgba(0,0,0,0.08) !important;
}
.ck-editor-wrapper .ck.ck-editor__main > .ck-editor__editable:not(.ck-focused) {
  border-color: rgba(0,0,0,0.08) !important;
}
.ck-editor-wrapper .ck.ck-editor__main > .ck-editor__editable.ck-focused {
  border-color: #036457 !important;
  box-shadow: 0 0 0 3px rgba(3,100,87,0.1) !important;
}
.ck-editor-wrapper--error .ck.ck-editor__main > .ck-editor__editable {
  border-color: #ba1a1a !important;
}
</style>
