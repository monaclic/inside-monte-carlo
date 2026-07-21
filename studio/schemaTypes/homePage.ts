import {HomeIcon} from '@sanity/icons/Home'
import {ImageIcon} from '@sanity/icons/Image'
import {defineArrayMember, defineField, defineType} from 'sanity'

export const homePage = defineType({
  name: 'homePage',
  title: "Page d'accueil",
  type: 'document',
  icon: HomeIcon,
  fields: [
    defineField({
      name: 'title',
      title: 'Nom interne',
      type: 'string',
      initialValue: "Page d'accueil",
      readOnly: true,
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'heroImage',
      title: 'Image principale',
      type: 'image',
      icon: ImageIcon,
      options: {hotspot: true},
    }),
    defineField({
      name: 'featuredStories',
      title: 'Contenus mis en avant',
      type: 'array',
      of: [
        defineArrayMember({
          name: 'featuredStory',
          title: 'Contenu mis en avant',
          type: 'object',
          fields: [
            defineField({
              name: 'category',
              title: 'Catégorie',
              type: 'string',
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: 'title',
              title: 'Titre',
              type: 'string',
              validation: (rule) => rule.required(),
            }),
            defineField({name: 'description', title: 'Description', type: 'text', rows: 3}),
            defineField({
              name: 'href',
              title: 'Lien',
              type: 'string',
              description: 'Exemple : /magazine',
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: 'image',
              title: 'Image',
              type: 'image',
              options: {hotspot: true},
              validation: (rule) => rule.required(),
            }),
          ],
          preview: {
            select: {title: 'title', subtitle: 'category', media: 'image'},
          },
        }),
      ],
      validation: (rule) => rule.max(6),
    }),
  ],
  preview: {prepare: () => ({title: "Page d'accueil"})},
})
