// /pages/categories/shared.tsx
import { categoryConfigMap } from '../../config/categoryColors';

export default function SharedCategoryPage({ category, articles }) {
  const config = categoryConfigMap[category];

  return (
    <div style={{ padding: '2rem', background: '#fafafa' }}>
      <h1 style={{ color: config.color }}>{category}</h1>
      {config.media.length > 0 && (
        <div style={{ marginBottom: '2rem' }}>
          {config.media.map((src, i) => (
            <img key={i} src={src} alt={`Media ${i}`} style={{ width: '100%', marginBottom: '1rem' }} />
          ))}
        </div>
      )}
      <div>
        {articles.map((a) => (
          <div key={a.slug} style={{ marginBottom: '1.5rem' }}>
            <h3>{a.title}</h3>
            <div>{a.date} · {a.author}</div>
            <p>{a.preview}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
