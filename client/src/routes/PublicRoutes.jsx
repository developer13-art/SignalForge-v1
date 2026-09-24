/**
 * Public Routes
 *
 * Marketing and unauthenticated routes. Uses the PublicLayout for
 * consistent branding and the top navigation bar.
 *
 * @module client/src/routes/PublicRoutes
 */

import { Route } from 'react-router-dom';
import PublicLayout from '../layouts/PublicLayout.jsx';

import Home from '../features/public/Home.jsx';
import HowItWorks from '../features/public/HowItWorks.jsx';
import Features from '../features/public/Features.jsx';
import FeaturesAi from '../features/public/FeaturesAi.jsx';
import FeaturesAutomatedTrading from '../features/public/FeaturesAutomatedTrading.jsx';
import FeaturesRisk from '../features/public/FeaturesRisk.jsx';
import FeaturesCopyTrading from '../features/public/FeaturesCopyTrading.jsx';
import FeaturesAnalytics from '../features/public/FeaturesAnalytics.jsx';
import FeaturesMarketplace from '../features/public/FeaturesMarketplace.jsx';
import Pricing from '../features/public/Pricing.jsx';
import Enterprise from '../features/public/Enterprise.jsx';
import WhiteLabel from '../features/public/WhiteLabel.jsx';
import ApiPlatform from '../features/public/ApiPlatform.jsx';
import Security from '../features/public/Security.jsx';
import About from '../features/public/About.jsx';
import Contact from '../features/public/Contact.jsx';
import Faq from '../features/public/Faq.jsx';
import Legal from '../features/public/Legal.jsx';
import Privacy from '../features/public/Privacy.jsx';
import Terms from '../features/public/Terms.jsx';

export default function PublicRoutes() {
  return (
    <Route element={<PublicLayout />}>
      <Route path="/" element={<Home />} />
      <Route path="/how-it-works" element={<HowItWorks />} />
      <Route path="/features" element={<Features />} />
      <Route path="/features/ai" element={<FeaturesAi />} />
      <Route path="/features/automated-trading" element={<FeaturesAutomatedTrading />} />
      <Route path="/features/risk" element={<FeaturesRisk />} />
      <Route path="/features/copy-trading" element={<FeaturesCopyTrading />} />
      <Route path="/features/analytics" element={<FeaturesAnalytics />} />
      <Route path="/features/marketplace" element={<FeaturesMarketplace />} />
      <Route path="/pricing" element={<Pricing />} />
      <Route path="/enterprise" element={<Enterprise />} />
      <Route path="/white-label" element={<WhiteLabel />} />
      <Route path="/api-platform" element={<ApiPlatform />} />
      <Route path="/security" element={<Security />} />
      <Route path="/about" element={<About />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/faq" element={<Faq />} />
      <Route path="/legal" element={<Legal />} />
      <Route path="/privacy" element={<Privacy />} />
      <Route path="/terms" element={<Terms />} />
    </Route>
  );
}