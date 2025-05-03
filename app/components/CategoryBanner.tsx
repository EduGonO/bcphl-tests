import React from 'react';

type Props = {
  category: string;
};

const CategoryBanner: React.FC<Props> = ({ category }) => {
  return (
    <div className="category-banner">
      <img src={`/media/categories/${category}.jpg`} alt={category} className="banner-image" />
      <h2 className="banner-title">{category}</h2>
      <style jsx>{`
        .category-banner {
          text-align: center;
          margin: 20px 0;
        }
        .banner-image {
          width: 100%;
          max-height: 300px;
          object-fit: cover;
        }
        .banner-title {
          font-size: 28px;
          margin-top: 10px;
          font-family: 'GayaRegular';
        }
      `}</style>
    </div>
  );
};

export default CategoryBanner;
