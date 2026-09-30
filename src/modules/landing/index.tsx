import { Source_Serif_4 } from 'next/font/google'
import Nav from './nav'
import Hero from './hero'
import Industries from './industries'
import VideoShowcase from './video'
import UseCases from './use-cases'
import AgentWalkthrough from './walkthrough'
import RoiCalculator from './roi-calculator'
import Products from './products'
import Channels from './channels'
import Agencies from './agencies'
import Developers from './developers'
import Faq from './faq'
import MobileCta from './mobile-cta'
import { ClosingCta, Footer } from './closing'

// Headline serif. The brief was the Forbes Billionaires page, whose headings
// are set in Forbes' proprietary "Highlander Bold"; Source Serif 4 at 700 is
// the closest freely licensed match. Self-hosted by next/font, and scoped to
// the landing page through this variable (see .xp-landing h1/h2 rules).
const headingFont = Source_Serif_4({
  subsets: ['latin'],
  weight: ['600', '700'],
  variable: '--font-xl-heading',
  display: 'swap',
})

// The public home page, ordered as a conversion path — and matching the
// order the leading voice-agent sites converge on (hero → proof → video →
// use cases → platform → FAQ → CTA):
//   attention  Hero: live call demo, one clear action
//   interest   who it's for, the product video, use cases, how it works
//   desire     what missed calls cost them, the full suite, channels, agencies
//   trust      the API for technical evaluators, then the FAQ's objections
//   action     closing CTA (plus a sticky bar on phones)
const LandingPage = () => (
  <div className={`xp-landing ${headingFont.variable}`}>
    <Nav />
    <main>
      <Hero />
      <Industries />
      <VideoShowcase />
      <UseCases />
      <AgentWalkthrough />
      <RoiCalculator />
      <Products />
      <Channels />
      <Agencies />
      <Developers />
      <Faq />
      <ClosingCta />
    </main>
    <Footer />
    <MobileCta />
  </div>
)

export default LandingPage
