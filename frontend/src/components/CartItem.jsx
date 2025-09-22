import { useEffect, useRef, useState } from 'react';
import { useCartStore } from '../stores/useCartStore'
import { Minus, Plus, Trash } from 'lucide-react';

const CartItem = ({item}) => {
    const { removeFromCart, updateQuantity } = useCartStore();
    let [quantity, setQuantity] = useState(item.quantity);
    useEffect(()=>{
        setQuantity(item.quantity)
    }, [item.quantity])

    /*
        1. Why not just let intervalId = 0; inside the component?
        let intervalId = 0;
        This variable resets every time the component re-renders.

        So after the first render, React re-runs the component, intervalId 
        becomes 0 again → clearTimeout(intervalId) does nothing.
        Debounce fails.

        2. Why not define let intervalId = 0; outside the component?
        let intervalId = 0; // outside
        Now it persists, but it’s shared across all component instances.

        If you have multiple cart items, clicking + on one item cancels the debounce of another item.
        Breaks when you render more than one item.

        3. Why useRef fixes it
        const intervalId = useRef(null);
        A ref’s .current value persists across re-renders (unlike let inside).
        Each component instance gets its own ref (unlike defining it outside).

        
        4. In short

        useRef is needed because:
        It gives you a persistent variable that doesn’t reset on re-render.
        It is scoped per component instance, so each cart item has its own timers.
        It avoids stale or conflicting timers, which are common debounce bugs.
    */
    const intervalIdIncrease = useRef(null);
    const intervalIdDecrease = useRef(null);
    
    const handleReduceQuantity = () => {
        // setQuantity(quantity - 1);
        // clearTimeout(intervalIdDecrease);
        /*
            why we are sending quantity-1 after updating in the first line of the function
            because it still contains the previous value not the updated one.
        */
        // intervalIdDecrease = setTimeout(() => updateQuantity(item._id, quantity-1), 1500);

        setQuantity(prevQuantity => {
            const newQuantity = prevQuantity - 1;
            clearTimeout(intervalIdDecrease.current);
            intervalIdDecrease.current = setTimeout(() => updateQuantity(item._id, newQuantity), 800);
            return newQuantity;
        })
    }
    const handleIncreaseQuantity = () => {
        // setQuantity(quantity + 1);
        // clearTimeout(intervalIdIncrease);
        // intervalIdIncrease = setTimeout(() => updateQuantity(item._id, quantity+1), 1500);

        setQuantity(prevQuantity => {
            const newQuantity = prevQuantity + 1;
            clearTimeout(intervalIdIncrease.current);
            intervalIdIncrease.current = setTimeout(() => updateQuantity(item._id, newQuantity), 800);
            return newQuantity;
        })
    }
    const handleRemoveFromCart = () => {
        removeFromCart(item._id)
    }
  return (
    <div className='rounded-lg border p-4 shadow-sm border-gray-700 bg-gray-800 md:py-6'>
      <div className='space-y-4 md:flex md:items-center md:justify-between md:gap-6 md:space-y-0'>
        <div className='shrink-0 md:order-1'>
            <img src={item.image} alt="no-image" className='h-20 md:h-32 rounded object-cover'/>
        </div>
      
        <label htmlFor="updateQuantityDiv" className='sr-only'>Choose quantity</label>
        <div id='updateQuantityDiv' className='flex items-center justify-between md:order-3 md:justify-end'>
            <div className='flex items-center gap-2'>
                <button className='inline-flex items-center h-5 w-5 shrink-0 rounded-md border border-gray-600 bg-gray-700
                 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-35 disabled:cursor-not-allowed'
                    onClick={handleReduceQuantity}
                    disabled={quantity <= 1}
                >   
                    <Minus className='text-gray-300'/>
                </button>
                <p>{quantity}</p>
                <button className='inline-flex items-center h-5 w-5 shrink-0 rounded-md border border-gray-600 bg-gray-700
                 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-emerald-500'
                    onClick={handleIncreaseQuantity}
                >   
                    <Plus className='text-gray-300'/>
                </button>
            </div>
            <div className='text-end md:order-4 md:w-32'>
                <p className='text-base font-bold text-emerald-400'>₹{item.price}</p>
            </div>
        </div>
        <div className='w-full min-w-0 flex-1 space-y-4 md:order-2 md:max-w-md'>
            <p className='text-base font-medium text-white hover:text-emerald-400 hover:underline'>
                {item.name}
            </p>
            <p className='text-sm text-gray-400'>{item.description}</p>
            <div className='flex items-center gap-4'>
                <button className='inline-flex items-center text-sm font-medium text-red-400 
                    hover:text-red-300 hover:underline'
                    onClick={handleRemoveFromCart}
                >
                    <Trash />
                </button>
            </div>
        </div>
      </div>
    </div>
  )
}

export default CartItem
