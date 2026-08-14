// Framer Motion Animation Variants

export const fadeIn = (duration = 0.5, delay = 0) => ({
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration, delay, ease: "easeOut" }
  }
});

export const slideUp = (duration = 0.5, delay = 0) => ({
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration, delay, ease: "easeOut" }
  }
});

export const slideDown = (duration = 0.5, delay = 0) => ({
  hidden: { opacity: 0, y: -20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration, delay, ease: "easeOut" }
  }
});

export const scaleIn = (duration = 0.4, delay = 0) => ({
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration, delay, ease: "easeOut" }
  }
});

export const staggerContainer = (staggerChildren = 0.1, delayChildren = 0) => ({
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren,
      delayChildren
    }
  }
});

export const slideInRight = (duration = 0.5, delay = 0) => ({
  hidden: { opacity: 0, x: 30 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration, delay, ease: "easeOut" }
  }
});

export const slideInLeft = (duration = 0.5, delay = 0) => ({
  hidden: { opacity: 0, x: -30 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration, delay, ease: "easeOut" }
  }
});

export const hoverScale = {
  hover: {
    scale: 1.02,
    transition: { duration: 0.2, ease: "easeInOut" }
  },
  tap: {
    scale: 0.98
  }
};
