import { useParams, Link } from "react-router-dom";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useState } from "react";
import { toast } from "sonner";
import { Plus, IndianRupee, TrendingUp, TrendingDown, ArrowLeft } from "lucide-react";
import { useTranslation } from "react-i18next";

export function Budget() {
  const { t } = useTranslation(['budget', 'common']);
  const { tripId } = useParams<{ tripId: string }>();
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [expenseForm, setExpenseForm] = useState({
    category: "food" as const,
    amount: "",
    description: "",
    date: new Date().toISOString().split('T')[0],
  });

  const trip = useQuery(api.trips.getTripById, { tripId: tripId as any });
  const budget = useQuery(api.budgets.getTripBudget, { tripId: tripId as any });
  const summary = useQuery(api.budgets.getBudgetSummary, budget?._id ? { budgetId: budget._id } : "skip");
  const expenses = useQuery(api.budgets.getBudgetExpenses, budget?._id ? { budgetId: budget._id } : "skip");
  const loggedInUser = useQuery(api.auth.loggedInUser);
  const userRequests = useQuery(api.tripRequests.getUserRequests);
  
  const isAuthor = loggedInUser && trip?.authorId === loggedInUser._id;
  const isParticipant = isAuthor || 
    userRequests?.some(req => req.tripId === tripId && req.status === "accepted") ||
    trip?.invitedFriends?.includes(loggedInUser?._id as any);
  
  const createBudget = useMutation(api.budgets.createBudget);
  const addExpense = useMutation(api.budgets.addExpense);

  const [budgetForm, setBudgetForm] = useState({
    travel: "",
    food: "",
    stay: "",
    activities: "",
    misc: "",
  });

  const categories = [
    { key: "travel" as const, label: t('budget:categories.travel'), icon: "🚗" },
    { key: "food" as const, label: t('budget:categories.food'), icon: "🍽️" },
    { key: "stay" as const, label: t('budget:categories.stay'), icon: "🏨" },
    { key: "activities" as const, label: t('budget:categories.activities'), icon: "🎯" },
    { key: "misc" as const, label: t('budget:categories.misc'), icon: "📦" },
  ];

  const handleCreateBudget = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const categories = {
      travel: Number(budgetForm.travel) || 0,
      food: Number(budgetForm.food) || 0,
      stay: Number(budgetForm.stay) || 0,
      activities: Number(budgetForm.activities) || 0,
      misc: Number(budgetForm.misc) || 0,
    };

    try {
      await createBudget({
        tripId: tripId as any,
        categories,
      });
      toast.success(t('budget:messages.created'));
    } catch (error: any) {
      toast.error(error.message || t('budget:messages.createError'));
    }
  };

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!budget) return;

    try {
      await addExpense({
        budgetId: budget._id,
        category: expenseForm.category,
        amount: Number(expenseForm.amount),
        description: expenseForm.description,
        date: expenseForm.date,
      });
      
      setExpenseForm({
        category: "food",
        amount: "",
        description: "",
        date: new Date().toISOString().split('T')[0],
      });
      setShowAddExpense(false);
      toast.success(t('budget:messages.expenseAdded'));
    } catch (error: any) {
      toast.error(error.message || t('budget:messages.addError'));
    }
  };

  if (!trip) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">{t('budget:messages.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link
            to={`/trips/${tripId}`}
            className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t('budget:backToTrip')}
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">{t('budget:title')}</h1>
          <p className="text-gray-600 mt-1">{trip.destination}</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!budget ? (
          /* Create Budget Form */
          <div className="bg-white rounded-xl shadow-sm p-8 text-center">
            {isAuthor ? (
              <>
                <h2 className="text-2xl font-semibold text-gray-900 mb-6 text-left">{t('budget:createTitle')}</h2>
                <form onSubmit={handleCreateBudget} className="space-y-6 text-left">
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {categories.map((category) => (
                      <div key={category.key}>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {category.icon} {category.label}
                        </label>
                        <div className="relative">
                          <IndianRupee className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                          <input
                            type="number"
                            min="0"
                            value={budgetForm[category.key]}
                            onChange={(e) => setBudgetForm(prev => ({ ...prev, [category.key]: e.target.value }))}
                            placeholder="0"
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="pt-4">
                    <button
                      type="submit"
                      className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      {t('budget:createTitle')}
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <div className="py-12">
                <IndianRupee className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                <h2 className="text-2xl font-semibold text-gray-900 mb-2">{t('budget:noBudget')}</h2>
                <p className="text-gray-600">{t('budget:noBudgetDesc')}</p>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-8">
            {/* Budget Overview */}
            {summary && (
              <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">{t('budget:overview.total')}</p>
                      <p className="text-2xl font-bold text-gray-900">₹{summary.totalBudget.toLocaleString()}</p>
                    </div>
                    <IndianRupee className="w-8 h-8 text-blue-600" />
                  </div>
                </div>
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">{t('budget:overview.spent')}</p>
                      <p className="text-2xl font-bold text-red-600">₹{summary.totalSpent.toLocaleString()}</p>
                    </div>
                    <TrendingUp className="w-8 h-8 text-red-600" />
                  </div>
                </div>
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">{t('budget:overview.remaining')}</p>
                      <p className={`text-2xl font-bold ${summary.remaining >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        ₹{summary.remaining.toLocaleString()}
                      </p>
                    </div>
                    <TrendingDown className={`w-8 h-8 ${summary.remaining >= 0 ? 'text-green-600' : 'text-red-600'}`} />
                  </div>
                </div>
              </div>
            )}

            {/* Category Breakdown */}
            {summary && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-6">{t('budget:sections.breakdown')}</h3>
                <div className="space-y-4">
                  {categories.map((category) => {
                    const budgetAmount = summary.budget[category.key];
                    const spentAmount = summary.spent[category.key];
                    const percentage = budgetAmount > 0 ? (spentAmount / budgetAmount) * 100 : 0;
                    
                    return (
                      <div key={category.key}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-700">
                            {category.icon} {category.label}
                          </span>
                          <span className="text-sm text-gray-600">
                            ₹{spentAmount.toLocaleString()} / ₹{budgetAmount.toLocaleString()}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${
                              percentage > 100 ? 'bg-red-600' : percentage > 80 ? 'bg-yellow-500' : 'bg-green-600'
                            }`}
                            style={{ width: `${Math.min(percentage, 100)}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Expenses */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900">{t('budget:sections.recentExpenses')}</h3>
                <button
                  onClick={() => setShowAddExpense(true)}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  {t('budget:addExpense.title')}
                </button>
              </div>

              {expenses && expenses.length > 0 ? (
                <div className="space-y-3">
                  {expenses.map((expense) => (
                    <div key={expense._id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <span className="text-lg">
                          {categories.find(c => c.key === expense.category)?.icon}
                        </span>
                        <div>
                          <p className="font-medium text-gray-900">{expense.description}</p>
                          <p className="text-sm text-gray-600">
                            {categories.find(c => c.key === expense.category)?.label} • {new Date(expense.date).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <span className="font-semibold text-gray-900">₹{expense.amount.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <IndianRupee className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-600">{t('budget:messages.noExpenses')}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Add Expense Modal */}
        {showAddExpense && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('budget:addExpense.title')}</h3>
              <form onSubmit={handleAddExpense} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t('budget:addExpense.category')}</label>
                  <select
                    value={expenseForm.category}
                    onChange={(e) => setExpenseForm(prev => ({ ...prev, category: e.target.value as any }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {categories.map((category) => (
                      <option key={category.key} value={category.key}>
                        {category.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t('budget:addExpense.amount')}</label>
                  <div className="relative">
                    <IndianRupee className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="number"
                      required
                      min="1"
                      value={expenseForm.amount}
                      onChange={(e) => setExpenseForm(prev => ({ ...prev, amount: e.target.value }))}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t('budget:addExpense.description')}</label>
                  <input
                    type="text"
                    required
                    value={expenseForm.description}
                    onChange={(e) => setExpenseForm(prev => ({ ...prev, description: e.target.value }))}
                    placeholder={t('budget:addExpense.descriptionPlaceholder')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t('budget:addExpense.date')}</label>
                  <input
                    type="date"
                    required
                    value={expenseForm.date}
                    onChange={(e) => setExpenseForm(prev => ({ ...prev, date: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div className="flex space-x-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    {t('budget:addExpense.submit')}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddExpense(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    {t('common:buttons.cancel')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
