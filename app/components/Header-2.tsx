// /app/components/Header.tsx
import React, { useState, useRef, useEffect } from 'react'
import ReactDOM from 'react-dom'
import Link from 'next/link'
import { categoryConfigMap, getCategoryLink } from '../../config/categoryColors'

export type Category = { name: string; color: string }

export type HeaderProps = {
  categories: Category[]
  onCategoryChange?: (category: string) => void
}

const Header: React.FC<HeaderProps> = ({ categories, onCategoryChange }) => {
  const [visible, setVisible] = useState(false)
  const [pos, setPos] = useState({ top: 0, left: 0 })
  const [hoverIn, setHoverIn] = useState(false)
  const [hoverDrop, setHoverDrop] = useState(false)
  const [portal, setPortal] = useState<HTMLElement | null>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)

  // merge configured + passed-in categories
  const merged = [
    ...Object.entries(categoryConfigMap).map(([n, c]) => ({ name: n, color: c.color })),
    ...categories.filter(c => !categoryConfigMap[c.name])
  ]

  // dropdown items vs header items
  const dropCats = merged.filter(c => categoryConfigMap[c.name]?.showInDropdown)
  const navCats  = merged.filter(c => categoryConfigMap[c.name]?.showInHeader)

  useEffect(() => {
    setPortal(document.body)
    document.documentElement.style.setProperty('--default-category-color', '#333')
    const onOver = (e: Event) => {
      const t = e.target as HTMLElement
      if (t.dataset.color) {
        document.documentElement.style.setProperty('--category-color', t.dataset.color)
      }
    }
    document.addEventListener('mouseover', onOver)
    return () => document.removeEventListener('mouseover', onOver)
  }, [])

  const show = () => {
    if (triggerRef.current) {
      const r = triggerRef.current.getBoundingClientRect()
      setPos({
        top: r.bottom,
        left: r.left + (window.innerWidth < 768 ? 0 : window.scrollX)
      })
    }
    setVisible(true)
  }
  const hide = () => setVisible(false)
  const hideWithDelay = () => setTimeout(() => !(hoverIn||hoverDrop) && hide(), 150)
  const toggle = () => (visible ? hide() : show())

  // dropdown JSX
  const dropdown = portal && ReactDOM.createPortal(
    <div
      className={`dropdown ${visible ? 'visible' : ''}`}
      style={{
        position: 'fixed',
        top: pos.top,
        left: pos.left,
        maxWidth: '300px',
        pointerEvents: visible ? 'auto' : 'none',
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(-10px)',
        transition: 'opacity .2s, transform .2s'
      }}
      onMouseEnter={() => setHoverDrop(true)}
      onMouseLeave={() => { setHoverDrop(false); hideWithDelay() }}
    >
      {dropCats.map((c, i) => (
        <Link key={c.name} href={getCategoryLink(c.name)}>
          <a
            className="dropdown-item"
            data-color={c.color}
            onClick={() => onCategoryChange?.(c.name)}
            style={{
              transitionDelay: `${i*30}ms`,
              opacity: visible ? 1 : 0,
              transform: visible ? 'translateY(0)' : 'translateY(-5px)'
            }}
          >
            {c.name}
          </a>
        </Link>
      ))}
    </div>,
    portal
  )

  return (
    <header className="header">
      <div className="header-top">
        <Link href="/">
          <a className="brand">
            <img src="/media/logo.png" alt="Logo" className="logo" />
            <h1>BICÉPHALE</h1>
          </a>
        </Link>
      </div>

      <nav>
        <ul className="nav-list">
          <li>
            <button
              ref={triggerRef}
              className="nav-trigger"
              onClick={toggle}
              onMouseEnter={() => { setHoverIn(true); setTimeout(show,50) }}
              onMouseLeave={() => { setHoverIn(false); hideWithDelay() }}
            >
              Rubriques
              <svg width="10" height="6" viewBox="0 0 10 6" fill="none">
                <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" />
              </svg>
            </button>
          </li>

          {navCats.map(c => (
            <li key={c.name}>
              <Link href={getCategoryLink(c.name)}>
                <a className="nav-item" onClick={() => onCategoryChange?.(c.name)}>
                  {c.name}
                </a>
              </Link>
            </li>
          ))}

          <li>
            <Link href="/indices">
              <a className="nav-item search" aria-label="Search">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2"/>
                  <line x1="21" y1="21" x2="16.65" y2="16.65" stroke="currentColor" strokeWidth="2"/>
                </svg>
              </a>
            </Link>
          </li>
        </ul>
      </nav>

      {dropdown}

      <style jsx>{`
        .header { position: relative; font-family: sans-serif; }
        .header-top { text-align: center; padding: 10px 0; background: #fff; }
        .brand { display: inline-flex; align-items: center; gap: 8px; text-decoration: none; color: #000 }
        .logo { height: 48px }
        nav { background: #f5f5f5; overflow-x: auto; }
        .nav-list {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 8px 16px;
          margin: 0;
          list-style: none;
          white-space: nowrap;
        }
        .nav-list li { margin: 0 }
        .nav-item,
        .nav-trigger {
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 6px 8px;
          background: none;
          border: none;
          font-size: 14px;
          cursor: pointer;
          text-decoration: none;
          color: #000;
        }
        .nav-item:hover,
        .nav-trigger:hover { background: rgba(0,0,0,0.05) }
        .search svg { width: 18px; height: 18px }
        .dropdown {
          background: rgba(255,255,255,0.95);
          backdrop-filter: blur(10px);
          border: 1px solid #e6e6e6;
          border-radius: 6px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }
        .dropdown-item {
          padding: 10px 16px;
          font-size: 14px;
          color: #333;
          text-decoration: none;
          background: none;
        }
        .dropdown-item:hover {
          background: rgba(240,240,240,0.8);
        }
      `}</style>
    </header>
  `)
}

export default Header
