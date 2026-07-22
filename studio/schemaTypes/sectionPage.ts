import {DocumentIcon} from '@sanity/icons/Document'
import {defineArrayMember, defineField, defineType} from 'sanity'

export const sectionPage = defineType({
  name: 'sectionPage',
  title: 'Pages et rubriques',
  type: 'document',
  icon: DocumentIcon,
  fields: [
    defineField({
      name: 'title',
      title: 'Titre',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Adresse de la page',
      type: 'slug',
      options: {source: 'title', maxLength: 96},
      validation: (rule) => rule.required(),
    }),
    defineField({name: 'eyebrow', title: 'Sur-titre', type: 'string'}),
    defineField({
      name: 'intro',
      title: 'Introduction',
      type: 'text',
      rows: 4,
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'image',
      title: 'Image principale',
      type: 'image',
      options: {hotspot: true},
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'contentImage',
      title: "Image dans l'article",
      description: "Cette image apparaît plus bas dans la page. Choisissez une photo différente de l'image principale.",
      type: 'image',
      options: {hotspot: true},
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'body',
      title: 'Contenu',
      type: 'array',
      of: [defineArrayMember({type: 'block'})],
    }),
    defineField({
      name: 'seo',
      title: 'Référencement Google',
      type: 'object',
      options: {collapsible: true, collapsed: true},
      fields: [
        defineField({name: 'title', title: 'Titre SEO', type: 'string'}),
        defineField({name: 'description', title: 'Description SEO', type: 'text', rows: 3}),
      ],
    }),
  ],
  preview: {
    select: {title: 'title', subtitle: 'slug.current', media: 'image'},
  },
})
