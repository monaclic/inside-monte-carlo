import {HomeIcon} from '@sanity/icons/Home'
import {ImageIcon} from '@sanity/icons/Image'
import {defineArrayMember, defineField, defineType} from 'sanity'

const articleFields = [
  defineField({
    name: 'title',
    title: 'Titre',
    type: 'string',
    validation: (rule) => rule.required(),
  }),
  defineField({name: 'description', title: 'Texte', type: 'text', rows: 3}),
  defineField({
    name: 'image',
    title: 'Image',
    type: 'image',
    icon: ImageIcon,
    options: {hotspot: true},
    validation: (rule) => rule.required(),
  }),
]

function articleList(name: string, title: string, maximum: number) {
  return defineField({
    name,
    title,
    description: "Les articles sont affichés sur le site dans l'ordre indiqué ici.",
    type: 'array',
    of: [
      defineArrayMember({
        name: 'homeArticle',
        title: 'Article',
        type: 'object',
        fields: articleFields,
        preview: {select: {title: 'title', subtitle: 'description', media: 'image'}},
      }),
    ],
    validation: (rule) => rule.max(maximum),
  })
}

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
    defineField({
      name: 'magazineImages',
      title: 'Magazine : les 5 images',
      description: "Les images sont affichées sur le site dans l'ordre indiqué ici.",
      type: 'array',
      of: [
        defineArrayMember({
          name: 'image',
          title: 'Image',
          type: 'image',
          icon: ImageIcon,
          options: {hotspot: true},
        }),
      ],
      validation: (rule) => rule.max(5),
      hidden: true,
    }),
    articleList('magazineArticles', 'Magazine : les 5 articles', 5),
    defineField({
      name: 'guardiansImage',
      title: 'Gardiens de la Principauté : image',
      type: 'image',
      icon: ImageIcon,
      options: {hotspot: true},
    }),
    defineField({
      name: 'keyImages',
      title: 'La Clé : les 4 images',
      description: "Les images sont affichées sur le site dans l'ordre indiqué ici.",
      type: 'array',
      of: [
        defineArrayMember({
          name: 'image',
          title: 'Image',
          type: 'image',
          icon: ImageIcon,
          options: {hotspot: true},
        }),
      ],
      validation: (rule) => rule.max(4),
      hidden: true,
    }),
    articleList('keyArticles', 'La Clé : les 4 articles', 4),
    defineField({
      name: 'experiencesImages',
      title: 'Expériences : les 5 images',
      description: "Les images sont affichées sur le site dans l'ordre indiqué ici.",
      type: 'array',
      of: [
        defineArrayMember({
          name: 'image',
          title: 'Image',
          type: 'image',
          icon: ImageIcon,
          options: {hotspot: true},
        }),
      ],
      validation: (rule) => rule.max(5),
      hidden: true,
    }),
    articleList('experiencesArticles', 'Expériences : les 5 articles', 5),
    defineField({
      name: 'premiumImages',
      title: 'Accès Premium : les 5 images',
      description: "Les images sont affichées sur le site dans l'ordre indiqué ici.",
      type: 'array',
      of: [
        defineArrayMember({
          name: 'image',
          title: 'Image',
          type: 'image',
          icon: ImageIcon,
          options: {hotspot: true},
        }),
      ],
      validation: (rule) => rule.max(5),
      hidden: true,
    }),
  ],
  preview: {prepare: () => ({title: "Page d'accueil"})},
})
