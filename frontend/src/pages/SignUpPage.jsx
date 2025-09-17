import { useState } from "react";
import { Link } from "react-router-dom";
import { UserPlus, Mail, Lock, User, ArrowRight, Loader } from 'lucide-react';
import { motion } from 'framer-motion';
import InputComponent from "../components/InputComponent";
import { useUserStore } from "../stores/useUserStore";

const SignUpPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const {signup, loading} = useUserStore();

  const handleSubmit = (e) => {
    e.preventDefault();
    signup(formData);
  }
  return (
    <div className='flex flex-col justify-center py-12 sm:px-6 lg:px-8'>
      <motion.div
        className='sm:mx-auto sm:w-full sm:max-w-md'
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <h2 className='mt-6 text-center text-3xl font-extrabold text-emerald-400'>Create your account</h2>
      </motion.div>

      <motion.div
        className='mt-8 sm:mx-auto sm:w-full sm:max-w-md'
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
      >
        <div className='bg-gray-800 py-8 px-4 shadow sm:rounded-lg sm:px-10'>
          <form onSubmit={handleSubmit} className="space-y-6">
            <InputComponent
              htmlfor="name"
              title="Full Name"
              id="name"
              type="text"
              placeholder="John Doe"
              value={formData.name}
              onchangeFn={(e) => setFormData({ ...formData, name: e.target.value })}
              LucideIcon={User} />

            <InputComponent
              htmlfor="email"
              title="Email Address"
              id="email"
              type="email"
              placeholder="you@example.com"
              value={formData.email}
              onchangeFn={(e) => setFormData({ ...formData, email: e.target.value })}
              LucideIcon={Mail} />

            <InputComponent
              htmlfor="password"
              title="Password"
              id="password"
              type="password"
              placeholder="********"
              value={formData.password}
              onchangeFn={(e) => setFormData({ ...formData, password: e.target.value })}
              LucideIcon={Lock} />

            <InputComponent
              htmlfor="confirmPassword"
              title="Confirm Password"
              id="confirmPassword"
              type="password" placeholder="********"
              value={formData.confirmPassword}
              onchangeFn={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              LucideIcon={Lock} />

            <button
              type='submit'
              className='w-full flex justify-center py-2 px-4 border border-transparent 
							rounded-md shadow-sm text-sm font-medium text-white bg-emerald-600
							 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2
							  focus:ring-emerald-500 transition duration-150 ease-in-out disabled:opacity-50'
              disabled={loading}
            >
              {
                loading ? (
                  <div className="flex items-center">
                    <Loader className="mr-2 h-5 w-5 animate-spin" aria-hidden='true' />
                    <span>loading</span>
                  </div>
                ) : (
                  <div className="flex items-center">
                    <UserPlus className='mr-2 h-5 w-5' aria-hidden='true'/>
                    <span>Sign up</span>
                  </div>
                )
              }
            </button>
          </form>
          <p className='mt-8 text-center text-sm text-gray-400'>
            Already have an account?{" "}
            <Link to={'/login'} className='font-medium text-emerald-400 hover:text-emerald-300'>
              Login here <ArrowRight className='inline h-4 w-4' />
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  )
}

export default SignUpPage
