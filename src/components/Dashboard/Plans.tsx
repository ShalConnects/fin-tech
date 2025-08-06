import React from 'react';
import { Check, Star } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

interface Plan {
  id: string;
  name: string;
  price: number;
  currency: string;
  features: string[];
  isPopular?: boolean;
}

const plans: Plan[] = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    currency: 'USD',
    features: [
      'Basic financial tracking',
      'Up to 3 accounts',
      'Basic reports',
      'Email support',
      'Transaction management',
      'Purchase tracking',
      'Basic analytics',
    ],
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 9.99,
    currency: 'USD',
    features: [
      'Everything in Free',
      'Unlimited accounts',
      'Advanced analytics',
      'Multi-currency support',
      'Priority support',
      'Custom categories',
      'Lend & Borrow tracking',
      'Last Wish - Digital Time Capsule',
      'Advanced reporting',
      'Data export',
    ],
    isPopular: true,
  },
];

export const Plans: React.FC = () => {
  const { user, profile } = useAuthStore();
  const currentPlan = profile?.subscription?.plan || 'free';

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Subscription Plans
        </h2>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Choose the perfect plan for your financial needs
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={`relative rounded-xl border ${
              plan.isPopular
                ? 'border-blue-500 shadow-lg dark:border-blue-400'
                : 'border-gray-200 dark:border-gray-700 shadow'
            } p-6 transition-all duration-200 hover:shadow-xl bg-white dark:bg-gray-800`}
          >
            {plan.isPopular && (
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="inline-flex items-center px-4 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                  <Star className="w-4 h-4 mr-1" />
                  Most Popular
                </span>
              </div>
            )}

            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{plan.name}</h3>
              <div className="mt-3 flex items-baseline justify-center">
                <span className="text-3xl font-bold text-gray-900 dark:text-white">
                  ${plan.price}
                </span>
                <span className="ml-1 text-lg text-gray-500 dark:text-gray-400">/month</span>
              </div>
            </div>

            <ul className="mt-6 space-y-3">
              {plan.features.map((feature, index) => (
                <li key={index} className="flex items-start">
                  <Check className="w-4 h-4 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">{feature}</span>
                </li>
              ))}
            </ul>

            <div className="mt-6">
              <button
                className={`w-full rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                  currentPlan === plan.id
                    ? 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                    : plan.isPopular
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-900 dark:bg-gray-700 text-white hover:bg-gray-800 dark:hover:bg-gray-600'
                }`}
                disabled={currentPlan === plan.id}
              >
                {currentPlan === plan.id ? 'Current Plan' : 'Get Started'}
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 text-center">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          All plans include a 14-day free trial. No credit card required.
        </p>
      </div>
    </div>
  );
}; 