import Link from 'next/link';
import { ArrowRight, Receipt, CreditCard, Repeat, Zap } from 'lucide-react';
import { WalletConnection } from '@/components/wallet-connection';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="flex justify-end mb-4">
            <WalletConnection />
          </div>
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Cross-Chain Payments
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Pay invoices and manage subscriptions across Base and Solana networks.
            Seamlessly bridge assets between chains.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <FeatureCard
            icon={<Receipt className="w-8 h-8" />}
            title="Create Invoices"
            description="Generate invoices payable with Base or Solana assets"
            href="/invoices/create"
          />
          <FeatureCard
            icon={<CreditCard className="w-8 h-8" />}
            title="Pay Invoices"
            description="Pay invoices using assets from either chain"
            href="/invoices"
          />
          <FeatureCard
            icon={<Repeat className="w-8 h-8" />}
            title="Subscriptions"
            description="Set up automated recurring payments"
            href="/subscriptions"
          />
          <FeatureCard
            icon={<Zap className="w-8 h-8" />}
            title="Dashboard"
            description="Track all your payments and invoices"
            href="/dashboard"
          />
        </div>

        {/* How It Works */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">
            How It Works
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Step
              number="1"
              title="Create Invoice"
              description="Specify amount, token, and destination chain. Generate a shareable invoice link."
            />
            <Step
              number="2"
              title="Pay Cross-Chain"
              description="Payer connects wallet and approves bridge transaction. Assets are automatically bridged."
            />
            <Step
              number="3"
              title="Receive Payment"
              description="Payment is confirmed on destination chain. Track status in real-time."
            />
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <Link
            href="/invoices/create"
            className="inline-flex items-center gap-2 bg-primary-600 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-primary-700 transition-colors"
          >
            Get Started
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
  href,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow border border-gray-100"
    >
      <div className="text-primary-600 mb-4">{icon}</div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </Link>
  );
}

function Step({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <div className="text-center">
      <div className="w-12 h-12 bg-primary-600 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
        {number}
      </div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}

