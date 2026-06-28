import { useState } from 'react'
import { motion } from 'framer-motion'

const plans = {
  buyer: [
    {
      name: 'Free Retailer',
      price: '₹0',
      period: '/forever',
      description: 'Essential tools for retailers to place basic orders.',
      features: [
        'Access to basic auctions',
        'Standard Bidding',
        'Basic order management',
        'Email notifications'
      ],
      buttonText: 'Get Started',
      premium: false
    },
    {
      name: 'Premium Retailer',
      price: '₹2,999',
      period: '/month',
      description: 'Advanced market intelligence and verified sourcing.',
      features: [
        'Everything in Free',
        'Verified Sellers Only Auctions',
        'Advanced Market Insights & Trends',
        'Budget Forecasting Tools',
        'Priority Support'
      ],
      buttonText: 'Upgrade to Premium',
      premium: true
    }
  ],
  seller: [
    {
      name: 'Free Supplier',
      price: '₹0',
      period: '/forever',
      description: 'Start bidding and grow your wholesale reach.',
      features: [
        'Bid on standard auctions',
        'Public Profile',
        'Basic inventory management',
        'Order tracking'
      ],
      buttonText: 'Start Selling',
      premium: false
    },
    {
      name: 'Premium Supplier',
      price: '₹4,999',
      period: '/month',
      description: 'Dominate the market with data and trust badges.',
      features: [
        'Everything in Free',
        '★ Premium Supplier Badge',
        'Bid on Verified-Only Auctions',
        'City Demand Heatmaps',
        'Competitor Insights'
      ],
      buttonText: 'Get Premium',
      premium: true
    }
  ]
}

export default function Pricing() {
  const [activeTab, setActiveTab] = useState('buyer')

  return (
    <div className="w-full h-full flex flex-col justify-center py-0 relative">
      <div className="text-center mb-12 relative z-10">
        <h2 className="text-4xl md:text-6xl font-black text-slate-900 mb-6 tracking-tight">
          Simple, transparent pricing
        </h2>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto font-medium">
          Whether you're a local kirana store or a massive wholesale supplier, we have a plan designed to accelerate your growth.
        </p>

        {/* Custom Toggle */}
        <div className="mt-8 flex items-center justify-center">
          <div className="bg-slate-200 p-1 rounded-full flex relative shadow-inner">
            <button
              onClick={() => setActiveTab('buyer')}
              className={`relative z-10 px-8 py-3 text-sm font-bold rounded-full transition-colors ${activeTab === 'buyer' ? 'text-slate-900' : 'text-slate-500 hover:text-slate-700'
                }`}
            >
              For Retailers (Buyers)
            </button>
            <button
              onClick={() => setActiveTab('seller')}
              className={`relative z-10 px-8 py-3 text-sm font-bold rounded-full transition-colors ${activeTab === 'seller' ? 'text-slate-900' : 'text-slate-500 hover:text-slate-700'
                }`}
            >
              For Suppliers (Sellers)
            </button>
            <div
              className={`absolute top-1 bottom-1 w-[50%] bg-white rounded-full shadow-md transition-all duration-300 ease-out ${activeTab === 'buyer' ? 'left-1' : 'left-[calc(50%-4px)]'
                }`}
            />
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto w-full relative z-10 px-4">
        {plans[activeTab].map((plan) => (
          <div
            key={plan.name}
            className={`relative rounded-3xl p-8 bg-white transition-all duration-300 ${plan.premium
              ? 'border-2 border-indigo-500 shadow-xl shadow-indigo-100 scale-105 z-10'
              : 'border border-slate-200 shadow-sm hover:shadow-md'
              }`}
          >
            {plan.premium && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-[11px] font-bold uppercase tracking-wider py-1.5 px-4 rounded-full shadow-lg">
                Most Popular
              </div>
            )}

            <h3 className="text-xl font-bold text-slate-900">{plan.name}</h3>
            <p className="text-slate-500 text-sm mt-2 min-h-[40px]">{plan.description}</p>

            <div className="my-6">
              <span className="text-5xl font-black text-slate-900">{plan.price}</span>
              <span className="text-slate-500 font-medium">{plan.period}</span>
            </div>

            <button
              className={`w-full py-4 rounded-xl font-bold transition-all ${plan.premium
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg shadow-indigo-200'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-900'
                }`}
            >
              {plan.buttonText}
            </button>

            <ul className="mt-8 space-y-4">
              {plan.features.map((feature, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <svg className={`w-5 h-5 shrink-0 ${plan.premium ? 'text-indigo-500' : 'text-slate-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-slate-600 text-sm font-medium">{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  )
}
