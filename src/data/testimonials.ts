// The testimonials, shared by the desktop cards (Testimonials.astro)
// and the phone homepage's short list (MobileHome.astro).
import logoPega from '../assets/testimonials/logos/Logo_Quote_Pega.svg';
import logoTulip from '../assets/testimonials/logos/Logo_Quote_Tulip.svg';
import logoStack from '../assets/testimonials/logos/Logo_Quote_Stack.svg';
import logoKoto from '../assets/testimonials/logos/Logo_Quote_Koto.svg';
import headshotMolly from '../assets/testimonials/headshots/Headshot_1_Molly.jpg';
import headshotMadilynn from '../assets/testimonials/headshots/Headshot_2_Madilynn.jpg';
import headshotDavid from '../assets/testimonials/headshots/Headshot_3_David.jpg';
import headshotJoe from '../assets/testimonials/headshots/Headshot_4_Joe.jpg';

// title/connector/company kept separate (rather than one string) so
// mobile can break the credit onto a third line between title and
// company while desktop still reads as one continuous line.
export const testimonials = [
	{
		logo: logoStack,
		company: 'Stack Overflow',
		quote:
			'Jake is a valued expert in the Stack brand. He provides valuable insight beyond design, particularly during the rebrand process — I so appreciate his points of view and candor.',
		name: 'David Longworth',
		title: 'Senior Director, Design',
		connector: ', ',
		headshot: headshotDavid,
	},
	{
		logo: logoPega,
		company: 'Pegasystems',
		quote:
			"I could put him in a room with a senior leader without hesitation and he'd hold his own with ease. If I had a full-time design position open, I would hire Jake immediately.",
		name: 'Molly Sullivan',
		title: 'Vice President, Brand',
		connector: ', ',
		headshot: headshotMolly,
	},
	{
		logo: logoKoto,
		company: 'Koto',
		quote:
			'Thanks so much for being such a great client. We had a wicked time working with you and Dave — I hope we get the chance to work together again.',
		name: 'Joe Ling',
		title: 'Creative Director',
		connector: ', ',
		headshot: headshotJoe,
	},
	{
		logo: logoTulip,
		company: 'Tulip',
		quote:
			"Jake's systematic approach was critical to Tulip's brand update. His token-based asset templates made it easy for the team to produce on-brand materials independently.",
		name: 'Madilynn Castillo',
		title: 'Chief Marketing Officer',
		connector: ', ',
		headshot: headshotMadilynn,
	},
];
