interface PageMetaProps {
  title: string
  description: string
}

export default function PageMeta({ title, description }: PageMetaProps) {
  const fullTitle = title === 'Likhan Siddiquee' ? title : `${title} · Likhan Siddiquee`
  return (
    <>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
    </>
  )
}
