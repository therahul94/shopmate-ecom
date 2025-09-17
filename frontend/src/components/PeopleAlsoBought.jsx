import { useEffect } from 'react';
import ProductCard from '../components/ProductCard'
import { useProductStore } from '../stores/useProductStore';

const PeopleAlsoBought = () => {
  const { recommendations, fetchRecommendedProducts } = useProductStore();
  useEffect(()=>{
    fetchRecommendedProducts()
  },[fetchRecommendedProducts]);
  return (
    <div className='mt-8'>
      <h3 className='text-2xl font-semibold text-emerald-400'>
        People also bought
      </h3>
      <div className='mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
        {recommendations.map(product => (
          <ProductCard key={product._id} product={product}/>
        ))
        }
      </div>
    </div>
  )
}

export default PeopleAlsoBought
