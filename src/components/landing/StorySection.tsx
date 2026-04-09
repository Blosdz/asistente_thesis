import { forwardRef, type ComponentPropsWithoutRef } from 'react';

import { cn } from '../../lib/cn';
import { useStorySection } from './SmoothScrollProvider';

type StorySectionProps = ComponentPropsWithoutRef<'section'> & {
  id: string;
};

const StorySection = forwardRef<HTMLElement, StorySectionProps>(function StorySection(
  { id, className, children, ...props },
  ref,
) {
  const { phase, isActive } = useStorySection(id);

  return (
    <section
      {...props}
      id={id}
      ref={ref}
      data-story-state={phase}
      data-story-active={isActive ? 'true' : 'false'}
      className={cn('story-section relative transition-all duration-500', className)}
    >
      {children}
    </section>
  );
});

export default StorySection;
