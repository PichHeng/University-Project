import { Link } from 'react-router-dom'

export function ButtonLink({ children, to, href, variant = 'primary', icon: Icon, download }) {
  const className = `btn btn-${variant}`
  const content = (
    <>
      {Icon ? <Icon aria-hidden="true" /> : null}
      <span>{children}</span>
    </>
  )

  if (href) {
    return (
      <a
        className={className}
        href={href}
        download={download}
        target={download ? undefined : '_blank'}
        rel="noreferrer"
      >
        {content}
      </a>
    )
  }

  return (
    <Link className={className} to={to}>
      {content}
    </Link>
  )
}
