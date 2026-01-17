// app/page.tsx
import PixelBlast from '@/components/PixelBlast';
import HeroClient from '@/app/pages/HeroClient';

export default function Home() {
  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-gray-950">
      {/* Background: allow pointer events so ripples work */}
      <div className="absolute inset-0 z-0 pointer-events-auto">
        <PixelBlast
          variant="circle"
          pixelSize={9}
          color="#B19EEF"
          patternScale={3}
          patternDensity={1.2}
          pixelSizeJitter={0.5}
          enableRipples
          rippleSpeed={0.4}
          rippleThickness={0.12}
          rippleIntensityScale={1.5}
          liquid={false}
          liquidStrength={0.12}
          liquidRadius={1.2}
          liquidWobbleSpeed={5}
          speed={0.6}
          edgeFade={0.25}
          transparent
        />
      </div>

      {/* Overlay: protect UI from background clicks */}
      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-4 pointer-events-none">
        {/* Buttons need pointer events back */}
        <div className="pointer-events-auto">
          <HeroClient />
        </div>
      </div>
    </div>
  );
}