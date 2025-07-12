import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default function FaqSection() {
  return (
    <section className="min-h-[600px] bg-black w-full px-8 space-y-6">
      <div className="container max-w-6xl mx-auto">
        <div className="text-end bg-gradient-to-r from-transparent via-gray-100/10 py-6 to-transparent">
          <h2 className="font-bold text-3xl lg:text-5xl">FAQ</h2>
          <p>Frequently user asked questions</p>
        </div>
        <Accordion type="single" collapsible className="w-full">
          {faqs.map((faq) => (
            <AccordionItem key={faq.question} value={faq.question}>
              <AccordionTrigger className="text-xl hover:no-underline">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent>{faq.answer}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}

const faqs = [
  {
    question: "What do I need to start playing?",
    answer:
      "You need a Web3 wallet (MetaMask, WalletConnect) and LP NFT in your wallet.",
  },
  {
    question: "What do I stake in a battle?",
    answer:
      "Your LP NFT is your stake. If you win, you claim both LPs. If you lose, your LP goes to your opponent.",
  },
  {
    question: "How are battles settled?",
    answer:
      "If one price range survives, that player wins. If both ranges fail or survive, the LP with the biggest gain wins.",
  },
  {
    question: "What if my LP value doesn’t match the opponent's?",
    answer:
      "Only LPs within a 0.5% value difference are matched. You’ll only see battles you can join.",
  },
  {
    question: "Is Liquid Arena safe to use?",
    answer:
      "Yes. All contracts are audited, funds are locked in escrow, and price data is sourced from secure oracles like Chainlink.",
  },
  {
    question: "What assets are supported?",
    answer:
      "The MVP supports Uniswap V3 LP NFTs. More DEX support is coming soon.",
  },
];
