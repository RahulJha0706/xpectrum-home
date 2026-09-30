import { INDUSTRIES } from './data'

// Stripe runs a strip of customer logos here. We list the industries the
// product is built for instead, until there are customer logos we have
// permission to show.
const Industries = () => (
  <section id='industries' className='relative border-y border-[var(--xl-border-subtle)] bg-[rgba(6,4,25,0.6)] py-10'>
    <p className='mb-6 text-center text-sm font-medium uppercase tracking-[0.18em] text-[var(--xl-txt4)]'>
      Front desks, support teams and the agencies that build for them
    </p>
    <div className='xl-marquee overflow-hidden'>
      <div className='xl-marquee-track'>
        {[...INDUSTRIES, ...INDUSTRIES].map((name, i) => (
          <span
            key={i}
            aria-hidden={i >= INDUSTRIES.length}
            className='xl-display mx-8 whitespace-nowrap text-2xl font-semibold text-white/55 transition-colors hover:text-white sm:text-[28px]'
          >
            {name}
          </span>
        ))}
      </div>
    </div>
  </section>
)

export default Industries
