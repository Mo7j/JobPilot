import Nav from './components/Nav';
import Hero from './components/Hero';
import ProblemSolution from './components/ProblemSolution';
import HowItWorks from './components/HowItWorks';
import AgentCrew from './components/AgentCrew';
import PipelineStory from './components/PipelineStory';
import YourData from './components/YourData';
import SetupPreview from './components/SetupPreview';
import Faq from './components/Faq';
import Footer from './components/Footer';

export default function App() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <ProblemSolution />
        <HowItWorks />
        <AgentCrew />
        <PipelineStory />
        <YourData />
        <SetupPreview />
        <Faq />
      </main>
      <Footer />
    </>
  );
}
