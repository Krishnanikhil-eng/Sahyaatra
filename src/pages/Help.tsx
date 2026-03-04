import { useState } from 'react';
import { PageTransition } from '../components/PageTransition';
import {
    Search,
    ChevronDown,
    ChevronUp,
    AlertTriangle,
    Phone,
    MessageSquare,
    Shield,
    MapPin,
    Sparkles,
    Users,
    QrCode,
    Mail,
    X,
    CheckCircle2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect } from 'react';
import { useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';

type FAQType = {
    question: string;
    answer: string;
    category: 'Trips' | 'AI' | 'QR' | 'Account';
};

const faqs: FAQType[] = [
    {
        category: 'Trips',
        question: 'How do I create a new trip?',
        answer: 'Navigate to the Trips page and click "Create Trip". Fill in the destination, dates, and whether the trip is Public (anyone can request to join) or Private. You can also specify the maximum number of members and estimated budget.'
    },
    {
        category: 'Trips',
        question: 'How do I join a public trip?',
        answer: 'On the Trips page, select a trip you are interested in. If it is public and has available spots, you can click "Join Trip" or "Request to Join". The trip host will need to approve your request if required.'
    },
    {
        category: 'AI',
        question: 'How does the AI create my itinerary?',
        answer: 'Our AI analyzes your destination, planned dates, and selected preferences (like budget level and travel style) to generate a personalized day-by-day itinerary with suggested activities and places to visit.'
    },
    {
        category: 'AI',
        question: 'Can I modify the AI-generated itinerary manually?',
        answer: 'Currently, the AI generates a comprehensive starting point. While you cannot directly edit the text of the AI suggestions, you can use the Chat feature in your trip to discuss changes with your co-travelers and make manual notes.'
    },
    {
        category: 'QR',
        question: 'How does the QR verification work when I meet my co-travellers?',
        answer: 'When a trip has at least two accepted members, a QR code becomes available to the trip host. When you meet your co-travelers in person, they can scan your QR code with their mobile device to officially verify their attendance.'
    },
    {
        category: 'QR',
        question: 'What if my QR code doesn\'t scan at the meeting point?',
        answer: 'Ensure your screen brightness is up and there is no glare. If it still fails, the trip host can manually verify your presence or you can reach out to support.'
    },
    {
        category: 'Account',
        question: 'Who can see the trips I’ve created?',
        answer: 'If your trip is marked "Private", only invited members can see it. If it is marked "Public", it will appear on the global Trips board for anyone to request to join.'
    }
];

export function Help() {
    const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);
    const [activeCategory, setActiveCategory] = useState<FAQType['category'] | 'All'>('All');

    // Modal State
    const [activeModal, setActiveModal] = useState<'safety' | 'emergency' | 'report' | null>(null);

    // Report Form State
    const [reportForm, setReportForm] = useState({
        name: '',
        email: '',
        type: 'QR verification failure',
        description: ''
    });
    const [reportStatus, setReportStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');

    const createReport = useMutation(api.reports.create);

    // Handle body scroll locking
    useEffect(() => {
        if (activeModal) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [activeModal]);

    // Handle ESC key to close modal
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') closeModal();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    const closeModal = () => {
        setActiveModal(null);
        setTimeout(() => setReportStatus('idle'), 300); // Reset status after animation
    };

    const handleReportSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setReportStatus('submitting');

        try {
            await createReport({
                name: reportForm.name,
                email: reportForm.email,
                type: reportForm.type,
                description: reportForm.description
            });

            setReportStatus('success');

            // Optionally auto-close after 3 seconds
            setTimeout(() => {
                closeModal();
                setReportForm({ name: '', email: '', type: 'QR verification failure', description: '' });
            }, 3000);
        } catch (error) {
            console.error("Failed to submit report:", error);
            setReportStatus('error');
            // Revert back to idle so they can try again
            setTimeout(() => setReportStatus('idle'), 3000);
        }
    };
    const filteredFaqs = faqs.filter(faq => {
        return activeCategory === 'All' || faq.category === activeCategory;
    });

    const categories: { id: FAQType['category'] | 'All', label: string, icon: React.ReactNode }[] = [
        { id: 'All', label: 'All', icon: <Search className="w-4 h-4" /> },
        { id: 'Trips', label: 'Trips', icon: <MapPin className="w-4 h-4" /> },
        { id: 'AI', label: 'AI Features', icon: <Sparkles className="w-4 h-4" /> },
        { id: 'QR', label: 'QR Verify', icon: <QrCode className="w-4 h-4" /> },
        { id: 'Account', label: 'Account', icon: <Users className="w-4 h-4" /> },
    ];

    return (
        <PageTransition>
            <div className="max-w-4xl mx-auto px-4 py-8">
                {/* Header section */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 mb-4">
                        How can we help you?
                    </h1>
                    <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
                        Browse the categories below to find answers to your travel and app-related questions.
                    </p>
                </div>

                {/* Quick Actions Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
                    <div
                        onClick={() => setActiveModal('safety')}
                        className="bg-gradient-to-br from-amber-50 to-orange-50 p-6 rounded-2xl border border-orange-100 hover:shadow-md transition-shadow cursor-pointer"
                        role="button"
                        tabIndex={0}
                    >
                        <div className="bg-orange-100 w-12 h-12 rounded-xl flex items-center justify-center mb-4 text-orange-600">
                            <Shield className="w-6 h-6" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Safety Guidelines</h3>
                        <p className="text-sm text-gray-600">Best practices for meeting co-travelers and staying safe on your journey.</p>
                    </div>

                    <div
                        onClick={() => setActiveModal('emergency')}
                        className="bg-gradient-to-br from-red-50 to-rose-50 p-6 rounded-2xl border border-rose-100 hover:shadow-md transition-shadow cursor-pointer"
                        role="button"
                        tabIndex={0}
                    >
                        <div className="bg-rose-100 w-12 h-12 rounded-xl flex items-center justify-center mb-4 text-rose-600">
                            <Phone className="w-6 h-6" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Emergency Contacts</h3>
                        <p className="text-sm text-gray-600">Quick access to national helplines, police, and medical services.</p>
                    </div>

                    <div
                        onClick={() => setActiveModal('report')}
                        className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-2xl border border-blue-100 hover:shadow-md transition-shadow cursor-pointer"
                        role="button"
                        tabIndex={0}
                    >
                        <div className="bg-blue-100 w-12 h-12 rounded-xl flex items-center justify-center mb-4 text-blue-600">
                            <MessageSquare className="w-6 h-6" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Report an Issue</h3>
                        <p className="text-sm text-gray-600">Found a bug or need direct support? Send us a message.</p>
                    </div>
                </div>

                {/* FAQs */}
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h2>

                    {/* Category Tabs */}
                    <div className="flex flex-wrap gap-2 mb-8">
                        {categories.map((cat) => (
                            <button
                                key={cat.id}
                                onClick={() => setActiveCategory(cat.id)}
                                className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${activeCategory === cat.id
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                            >
                                {cat.icon}
                                <span>{cat.label}</span>
                            </button>
                        ))}
                    </div>

                    <div className="space-y-4">
                        {filteredFaqs.length > 0 ? (
                            filteredFaqs.map((faq, index) => (
                                <div
                                    key={index}
                                    className="border border-gray-100 rounded-xl overflow-hidden hover:border-blue-200 transition-colors"
                                >
                                    <button
                                        onClick={() => setOpenFaqIndex(openFaqIndex === index ? null : index)}
                                        className="w-full flex items-center justify-between p-5 bg-gray-50/50 text-left focus:outline-none"
                                    >
                                        <span className="font-medium text-gray-900 pr-8">{faq.question}</span>
                                        {openFaqIndex === index ? (
                                            <ChevronUp className="w-5 h-5 text-gray-400 flex-shrink-0" />
                                        ) : (
                                            <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />
                                        )}
                                    </button>
                                    <AnimatePresence>
                                        {openFaqIndex === index && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                transition={{ duration: 0.2 }}
                                            >
                                                <div className="p-5 pt-0 text-gray-600 border-t border-gray-100 bg-white">
                                                    <div className="mt-4">
                                                        {faq.answer}
                                                    </div>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-12 text-gray-500">
                                <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                                <p>No articles found in this category.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Still need help footer */}
                <div className="mt-12 text-center bg-gray-900 text-white rounded-3xl p-8 relative overflow-hidden">
                    <div className="absolute top-0 right-0 -mt-16 -mr-16 text-white/5">
                        <Mail className="w-64 h-64" />
                    </div>
                    <h2 className="text-2xl font-bold mb-4 relative z-10">Still need help?</h2>
                    <p className="text-gray-300 mb-6 relative z-10">
                        Can't find the answer you're looking for? Our support team is here to help with any travel emergencies or app issues.
                    </p>
                    <button
                        onClick={() => setActiveModal('report')}
                        className="bg-white text-gray-900 px-8 py-3 rounded-xl font-semibold hover:bg-gray-100 transition-colors relative z-10 hover:scale-105 transform"
                    >
                        Contact Support
                    </button>
                </div>
            </div>

            {/* Modals */}
            <AnimatePresence>
                {activeModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={closeModal}
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        />

                        {/* Modal Content */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto relative z-10"
                            role="dialog"
                            aria-modal="true"
                        >
                            <div className="sticky top-0 bg-white/80 backdrop-blur-md px-6 py-4 border-b border-gray-100 flex justify-between items-center z-20">
                                <h2 className="text-xl font-bold text-gray-900">
                                    {activeModal === 'safety' && 'Safety Guidelines'}
                                    {activeModal === 'emergency' && 'Emergency Contacts'}
                                    {activeModal === 'report' && 'Report an Issue'}
                                </h2>
                                <button
                                    onClick={closeModal}
                                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                                    aria-label="Close modal"
                                >
                                    <X className="w-6 h-6 text-gray-500" />
                                </button>
                            </div>

                            <div className="p-6">
                                {/* Safety Guidelines Content */}
                                {activeModal === 'safety' && (
                                    <div className="space-y-6 text-gray-600">
                                        <section>
                                            <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center">
                                                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold mr-3">1</div>
                                                Before Meeting Co-Travelers
                                            </h3>
                                            <ul className="list-disc pl-11 space-y-2">
                                                <li>Verify the trip host profile.</li>
                                                <li>Use in-app QR verification before meeting.</li>
                                                <li>Share trip details with a trusted contact.</li>
                                            </ul>
                                        </section>
                                        <section>
                                            <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center">
                                                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold mr-3">2</div>
                                                During the Trip
                                            </h3>
                                            <ul className="list-disc pl-11 space-y-2">
                                                <li>Meet in public locations first.</li>
                                                <li>Keep emergency contacts saved.</li>
                                                <li>Avoid sharing sensitive personal information.</li>
                                            </ul>
                                        </section>
                                        <section>
                                            <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center">
                                                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold mr-3">3</div>
                                                Digital Safety
                                            </h3>
                                            <ul className="list-disc pl-11 space-y-2">
                                                <li>Do not share OTPs or passwords.</li>
                                                <li>Report suspicious activity immediately.</li>
                                                <li>Use only in-app chat for communication.</li>
                                            </ul>
                                        </section>
                                        <section>
                                            <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center">
                                                <div className="w-8 h-8 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center font-bold mr-3">!</div>
                                                Emergency Protocol
                                            </h3>
                                            <ul className="list-disc pl-11 space-y-2">
                                                <li>Contact local authorities in unsafe situations.</li>
                                                <li>Refer to emergency numbers listed in the Help section.</li>
                                            </ul>
                                        </section>
                                    </div>
                                )}

                                {/* Emergency Contacts Content */}
                                {activeModal === 'emergency' && (
                                    <div>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                                            {[
                                                { label: 'Police', number: '100', icon: Shield, color: 'blue' },
                                                { label: 'Ambulance', number: '108', icon: Phone, color: 'rose' },
                                                { label: 'Women Helpline', number: '181', icon: Users, color: 'purple' },
                                                { label: 'Child Helpline', number: '1098', icon: Users, color: 'amber' },
                                                { label: 'National Emergency', number: '112', icon: AlertTriangle, color: 'red' },
                                            ].map((contact, i) => (
                                                <div key={i} className="flex items-center p-4 bg-gray-50 rounded-xl border border-gray-100">
                                                    <div className={`w-12 h-12 rounded-full bg-${contact.color}-100 text-${contact.color}-600 flex items-center justify-center mr-4`}>
                                                        <contact.icon className="w-6 h-6" />
                                                    </div>
                                                    <div>
                                                        <div className="text-sm text-gray-500 font-medium">{contact.label}</div>
                                                        <div className="text-xl font-bold text-gray-900">{contact.number}</div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 p-4 rounded-xl flex items-start">
                                            <AlertTriangle className="w-5 h-5 mr-3 flex-shrink-0 mt-0.5" />
                                            <p className="text-sm font-medium">If traveling internationally, contact local emergency services.</p>
                                        </div>
                                    </div>
                                )}

                                {/* Report an Issue Content */}
                                {activeModal === 'report' && (
                                    <div>
                                        {reportStatus === 'success' ? (
                                            <motion.div
                                                initial={{ opacity: 0, scale: 0.9 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                className="text-center py-12"
                                            >
                                                <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
                                                <h3 className="text-2xl font-bold text-gray-900 mb-2">Report Submitted Successfully</h3>
                                                <p className="text-gray-600">Thank you for letting us know. We look into issues promptly to keep the community safe.</p>
                                            </motion.div>
                                        ) : (
                                            <form onSubmit={handleReportSubmit} className="space-y-5">
                                                {reportStatus === 'error' && (
                                                    <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4">
                                                        Failed to submit report. Please try again later.
                                                    </div>
                                                )}
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                                    <div>
                                                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                                                        <input
                                                            type="text"
                                                            id="name"
                                                            required
                                                            disabled={reportStatus === 'submitting'}
                                                            value={reportForm.name}
                                                            onChange={(e) => setReportForm({ ...reportForm, name: e.target.value })}
                                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors disabled:opacity-50"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                                        <input
                                                            type="email"
                                                            id="email"
                                                            required
                                                            disabled={reportStatus === 'submitting'}
                                                            value={reportForm.email}
                                                            onChange={(e) => setReportForm({ ...reportForm, email: e.target.value })}
                                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors disabled:opacity-50"
                                                        />
                                                    </div>
                                                </div>

                                                <div>
                                                    <label htmlFor="issueType" className="block text-sm font-medium text-gray-700 mb-1">Issue Type</label>
                                                    <select
                                                        id="issueType"
                                                        value={reportForm.type}
                                                        disabled={reportStatus === 'submitting'}
                                                        onChange={(e) => setReportForm({ ...reportForm, type: e.target.value })}
                                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white disabled:opacity-50"
                                                    >
                                                        <option value="QR verification failure">QR verification failure</option>
                                                        <option value="AI itinerary issue">AI itinerary issue</option>
                                                        <option value="Trip management issue">Trip management issue</option>
                                                        <option value="Suspicious user">Suspicious user</option>
                                                        <option value="Other">Other</option>
                                                    </select>
                                                </div>

                                                <div>
                                                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                                    <textarea
                                                        id="description"
                                                        required
                                                        rows={5}
                                                        disabled={reportStatus === 'submitting'}
                                                        value={reportForm.description}
                                                        onChange={(e) => setReportForm({ ...reportForm, description: e.target.value })}
                                                        placeholder="Please describe the issue in detail..."
                                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none disabled:opacity-50"
                                                    ></textarea>
                                                </div>

                                                <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
                                                    <button
                                                        type="button"
                                                        onClick={closeModal}
                                                        disabled={reportStatus === 'submitting'}
                                                        className="px-6 py-2.5 rounded-xl font-medium text-gray-600 hover:bg-gray-100 transition-colors disabled:opacity-50"
                                                    >
                                                        Cancel
                                                    </button>
                                                    <button
                                                        type="submit"
                                                        disabled={reportStatus === 'submitting'}
                                                        className="px-6 py-2.5 rounded-xl font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-sm hover:shadow-md disabled:bg-blue-400 disabled:cursor-not-allowed flex items-center"
                                                    >
                                                        {reportStatus === 'submitting' ? (
                                                            <>
                                                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                                </svg>
                                                                Submitting...
                                                            </>
                                                        ) : (
                                                            'Submit Report'
                                                        )}
                                                    </button>
                                                </div>
                                            </form>
                                        )}
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </PageTransition>
    );
}
