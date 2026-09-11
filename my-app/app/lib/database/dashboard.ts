import { HealthTip } from "../types";

/**
 * Curated list of health & nutrition tips with rich imagery
 */
export const HEALTH_TIPS: HealthTip[] = [
    {
        id: 'tip-1',
        title: 'Hydration & Metabolism',
        category: 'Hydration',
        tagColor: 'var(--macro-carb)',
        detail: 'Drinking 500ml of cold water can temporarily boost resting energy expenditure by 24–30% for about an hour.',
        imageUrl: 'https://images.unsplash.com/photo-1548839140-29a749e1bc4e?w=600&auto=format&fit=crop&q=80',
        readTime: '2 min read',
    },
    {
        id: 'tip-2',
        title: 'The Power of Protein Pacing',
        category: 'Nutrition',
        tagColor: 'var(--macro-protein)',
        detail: 'Distributing protein evenly across 3–4 meals (25–35g per meal) optimizes muscle protein synthesis far better than a single large dinner.',
        imageUrl: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=600&auto=format&fit=crop&q=80',
        readTime: '3 min read',
    },
    {
        id: 'tip-3',
        title: 'Smart Carbs for Steady Energy',
        category: 'Energy',
        tagColor: 'var(--macro-fat)',
        detail: 'Pairing complex carbs (oats, sweet potatoes, quinoa) with healthy fats or fiber reduces glycemic spikes and prevents afternoon energy slumps.',
        imageUrl: 'https://images.unsplash.com/photo-1505576399279-565b52d4ac71?w=600&auto=format&fit=crop&q=80',
        readTime: '2 min read',
    },
    {
        id: 'tip-4',
        title: 'Post-Meal Walking Benefit',
        category: 'Metabolism',
        tagColor: 'var(--mint)',
        detail: 'A brisk 10-minute walk right after eating improves insulin sensitivity and stimulates glucose clearance into muscle tissue.',
        imageUrl: 'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=600&auto=format&fit=crop&q=80',
        readTime: '1 min read',
    },
    {
        id: 'tip-5',
        title: 'Healthy Fats for Hormonal Balance',
        category: 'Wellness',
        tagColor: 'var(--peach)',
        detail: 'Avocados, extra virgin olive oil, and walnuts provide essential fatty acids necessary for hormone synthesis and nutrient absorption.',
        imageUrl: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600&auto=format&fit=crop&q=80',
        readTime: '2 min read',
    },
];