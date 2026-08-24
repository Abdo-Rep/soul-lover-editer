import { createContext, useContext } from 'react'
import { motion } from 'framer-motion'
import { getRevealMotion } from '../utils/motion'

const RevealContext = createContext(false)

const motionElements = {
  div: motion.div,
  section: motion.section,
  article: motion.article,
  header: motion.header,
  li: motion.li,
  p: motion.p,
  ol: motion.ol,
}

function buildItemVariants(reveal, delay = 0) {
  return {
    hidden: { opacity: 0, y: reveal.y },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: reveal.duration,
        ease: reveal.ease,
        delay,
      },
    },
  }
}

export function RevealGroup({ children, className = '', as = 'div', delay = 0 }) {
  const reveal = getRevealMotion()
  const Component = motionElements[as] ?? motion.div

  return (
    <RevealContext.Provider value={true}>
      <Component
        className={className}
        initial="hidden"
        animate="visible"
        variants={{
          hidden: {},
          visible: {
            transition: {
              delayChildren: delay,
              staggerChildren: reveal.stagger,
            },
          },
        }}
      >
        {children}
      </Component>
    </RevealContext.Provider>
  )
}

export function RevealItem({
  children,
  className = '',
  as = 'div',
  delay = 0,
  ...rest
}) {
  const inGroup = useContext(RevealContext)
  const reveal = getRevealMotion()
  const Component = motionElements[as] ?? motion.div
  const variants = buildItemVariants(reveal, delay)

  if (inGroup) {
    return (
      <Component className={className} variants={variants} {...rest}>
        {children}
      </Component>
    )
  }

  return (
    <Component
      className={className}
      initial="hidden"
      animate="visible"
      variants={variants}
      {...rest}
    >
      {children}
    </Component>
  )
}
