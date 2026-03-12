import { useState } from 'react';
import { useApp, Category } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { CategoryTag } from '@/components/CategoryTag';
import { AddEditCategoryModal } from '@/components/AddEditCategoryModal';
import { toast } from '@/hooks/use-toast';

const Categories = () => {
  const { currentUser, categories, deleteCategory } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

  if (currentUser?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="bg-card rounded-2xl shadow-card p-12 border border-border text-center max-w-md">
          <h2 className="text-2xl font-bold text-foreground mb-4">Admin Only</h2>
          <p className="text-muted-foreground">
            Category management is restricted to administrators. Please contact your admin for access.
          </p>
        </div>
      </div>
    );
  }

  const handleEdit = (category: Category) => {
    setSelectedCategory(category);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this category?')) {
      try {
        await deleteCategory(id);
        toast({
          title: "Deleted",
          description: "Category deleted successfully",
        });
      } catch (error) {
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : 'Delete failed',
          variant: 'destructive',
        });
      }
    }
  };

  const handleAddNew = () => {
    setSelectedCategory(null);
    setIsModalOpen(true);
  };

  const incomeCategories = categories.filter(c => c.type === 'income');
  const expenseCategories = categories.filter(c => c.type === 'expense');

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Categories</h1>
            <p className="text-muted-foreground mt-1">Manage transaction categories</p>
          </div>
          <Button onClick={handleAddNew} size="lg" className="shadow-md">
            <Plus className="w-5 h-5 mr-2" />
            Add Category
          </Button>
        </div>

        {/* Income Categories */}
        <div className="bg-card rounded-2xl shadow-card p-6 border border-border">
          <h2 className="text-xl font-bold text-foreground mb-4">Income Categories</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {incomeCategories.map(category => (
              <div
                key={category.id}
                className="flex items-center justify-between p-4 bg-secondary/50 rounded-xl border border-border"
              >
                <CategoryTag name={category.name} color={category.color} />
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleEdit(category)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDelete(category.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Expense Categories */}
        <div className="bg-card rounded-2xl shadow-card p-6 border border-border">
          <h2 className="text-xl font-bold text-foreground mb-4">Expense Categories</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {expenseCategories.map(category => (
              <div
                key={category.id}
                className="flex items-center justify-between p-4 bg-secondary/50 rounded-xl border border-border"
              >
                <CategoryTag name={category.name} color={category.color} />
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleEdit(category)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDelete(category.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <AddEditCategoryModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedCategory(null);
        }}
        category={selectedCategory}
      />
    </div>
  );
};

export default Categories;
