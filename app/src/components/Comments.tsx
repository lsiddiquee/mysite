import Giscus from '@giscus/react'

export default function Comments() {
  return (
    <section aria-labelledby="comments-heading" className="border-t border-stone-200 pt-10">
      <h2 id="comments-heading" className="font-display text-2xl font-semibold text-stone-950">
        Join the conversation
      </h2>
      <p className="mt-2 mb-6 text-sm text-stone-600">
        Comments are powered by GitHub Discussions.
      </p>
      <Giscus
        repo="lsiddiquee/mysite"
        repoId="R_kgDOTalBoA"
        category="General"
        categoryId="DIC_kwDOTalBoM4DBYiZ"
        mapping="pathname"
        strict="1"
        reactionsEnabled="1"
        emitMetadata="0"
        inputPosition="top"
        theme="preferred_color_scheme"
        lang="en"
        loading="lazy"
      />
    </section>
  )
}
