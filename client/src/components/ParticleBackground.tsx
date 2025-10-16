import { useCallback } from 'react';
import Particles from '@tsparticles/react';
import { loadSlim } from '@tsparticles/slim';

export default function ParticleBackground() {
  const particlesInit = useCallback(async (engine: unknown) => {
    // loadSlim adds the slim bundle features to the engine instance
    // casting to any to avoid versioned type mismatch between packages
    await loadSlim(engine as any);
  }, []);

  return (
    <Particles
      id="tsparticles"
      // some versions expose init as a prop, others require using "particlesInit" via wrapper
      // keep as init; types may not include it, so cast via any
      {...({ init: particlesInit } as any)}
      options={{
        background: {
          color: {
            value: 'transparent',
          },
        },
        fpsLimit: 120,
        interactivity: {
          events: {
            onClick: {
              enable: true,
              mode: 'push',
            },
            onHover: {
              enable: true,
              mode: 'repulse',
            },
            // resize is a top-level option in newer versions; remove from events to satisfy types
          },
          modes: {
            push: {
              quantity: 4,
            },
            repulse: {
              distance: 200,
              duration: 0.4,
            },
          },
        },
        particles: {
          color: {
            value: ['#22c55e', '#16a34a', '#15803d'],
          },
          links: {
            color: '#22c55e',
            distance: 150,
            enable: true,
            opacity: 0.3,
            width: 1,
          },
          move: {
            direction: 'none',
            enable: true,
            outModes: {
              default: 'bounce',
            },
            random: false,
            speed: 1,
            straight: false,
          },
          number: {
            density: {
              enable: true,
              width: 800,
              height: 600,
            },
            value: 80,
          },
          opacity: {
            value: 0.5,
          },
          shape: {
            type: 'circle',
          },
          size: {
            value: { min: 1, max: 5 },
          },
        },
        detectRetina: true,
      }}
      className="absolute inset-0 -z-10"
    />
  );
}
