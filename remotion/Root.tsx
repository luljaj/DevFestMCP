import { Composition } from 'remotion';
import { HeroVideo } from './compositions/HeroVideo';
import { LiveGraphDemo } from './compositions/LiveGraphDemo';
import { LiveMCPDemo } from './compositions/LiveMCPDemo';
import { LiveAppDemo } from './compositions/LiveAppDemo';

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="HeroVideo"
        component={HeroVideo}
        durationInFrames={300}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{
          titleText: 'Relay',
          subtitleText: 'The Coordination Layer for AI Coding Agents',
        }}
      />
      <Composition
        id="LiveGraphDemo"
        component={LiveGraphDemo}
        durationInFrames={480}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{
          isDark: true,
        }}
      />
      <Composition
        id="LiveMCPDemo"
        component={LiveMCPDemo}
        durationInFrames={450}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{
          isDark: true,
        }}
      />
      <Composition
        id="LiveAppDemo"
        component={LiveAppDemo}
        durationInFrames={450}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{
          isDark: true,
        }}
      />
    </>
  );
};
