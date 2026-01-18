"use client";

import {
    Edit,
    Loader2,
    Plus,
    Search,
    Trash2,
    X,
} from "lucide-react";
import * as React from "react";
import { toast } from "sonner";
import { CategoryTableSkeleton } from "~/ui/components/admin/product-skeletons";

import { Badge } from "~/ui/primitives/badge";
import { Button } from "~/ui/primitives/button";
import {
    Card,
    CardContent,
} from "~/ui/primitives/card";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "~/ui/primitives/dialog";
import { Input } from "~/ui/primitives/input";
import { Label } from "~/ui/primitives/label";
import { Switch } from "~/ui/primitives/switch";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "~/ui/primitives/table";

interface Category {
    _id: string;
    name: string;
    slug: string;
    icon?: string;
    isActive: boolean;
    showInMenu: boolean;
    showInHomepage: boolean;
    subcategories: (string | { name: string; _id?: string })[];
    productCount: number;
}

interface CategoryManagerProps {
    onUpdate: () => void;
}

export function CategoryManager({ onUpdate }: CategoryManagerProps) {
    const [searchQuery, setSearchQuery] = React.useState("");
    const [categories, setCategories] = React.useState<Category[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [dialogOpen, setDialogOpen] = React.useState(false);
    const [editingCategory, setEditingCategory] = React.useState<Category | null>(null);
    const [categoryName, setCategoryName] = React.useState("");
    const [icon, setIcon] = React.useState("");
    const [isActive, setIsActive] = React.useState(true);
    const [showInMenu, setShowInMenu] = React.useState(true);
    const [showInHomepage, setShowInHomepage] = React.useState(false);
    const [subcategories, setSubcategories] = React.useState<string[]>([]);
    const [newSubcategory, setNewSubcategory] = React.useState("");
    const [saveLoading, setSaveLoading] = React.useState(false);

    const fetchCategories = React.useCallback(async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem("mk-dental-token");
            const response = await fetch("/api/admin/categories", {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = (await response.json()) as { success: boolean; data: { categories: Category[] }; message?: string };
            if (data.success) {
                console.log("Fetched categories:", data.data.categories);
                setCategories(data.data.categories);
            }

        } catch (error) {
            console.error("Fetch categories error:", error);
            toast.error("Failed to load categories");
        } finally {
            setLoading(false);
        }
    }, []);

    React.useEffect(() => {
        fetchCategories();
    }, [fetchCategories]);

    const filteredCategories = categories.filter((cat) =>
        cat.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleCreate = () => {
        setEditingCategory(null);
        setCategoryName("");
        setIcon("");
        setIsActive(true);
        setShowInMenu(true);
        setShowInHomepage(false);
        setSubcategories([]);
        setNewSubcategory("");
        setDialogOpen(true);
    };

    const handleEdit = (category: Category) => {
        setEditingCategory(category);
        setCategoryName(category.name);
        setIcon(category.icon || "");
        setIsActive(category.isActive);
        setShowInMenu(category.showInMenu !== undefined ? category.showInMenu : true);
        setShowInHomepage(category.showInHomepage || false);

        // Ensure subcategories are strings for the state
        const subStrings = (category.subcategories || []).map(s =>
            typeof s === 'string' ? s : s.name
        );
        setSubcategories(subStrings);

        setNewSubcategory("");
        setDialogOpen(true);
    };

    const handleSave = async () => {
        if (!categoryName) {
            toast.error("Category name is required");
            return;
        }

        setSaveLoading(true);
        try {
            const token = localStorage.getItem("mk-dental-token");
            console.log("Saving category, editingCategory:", editingCategory);
            const url = editingCategory
                ? `/api/admin/categories/${editingCategory._id}`
                : "/api/admin/categories";
            const method = editingCategory ? "PUT" : "POST";

            const response = await fetch(url, {
                method,
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name: categoryName,
                    icon,
                    isActive,
                    showInMenu,
                    showInHomepage,
                    subcategories: subcategories.map(s => ({ name: s })),
                }),
            });

            const data = (await response.json()) as { success: boolean; message?: string };
            if (data.success) {
                toast.success(editingCategory ? "Category updated" : "Category created");

                setDialogOpen(false);
                fetchCategories();
                onUpdate(); // Refresh parent (Product list categories might have changed)
            } else {
                toast.error(data.message || "Failed to save category");
            }
        } catch (error) {
            console.error("Save category error:", error);
            toast.error("An error occurred while saving");
        } finally {
            setSaveLoading(false);
        }
    };

    const handleToggleStatus = async (category: Category) => {
        try {
            console.log("Toggling status for category:", category);
            const token = localStorage.getItem("mk-dental-token");
            const response = await fetch(`/api/admin/categories/${category._id}`, {
                method: "PUT",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    isActive: !category.isActive,
                }),
            });

            const data = (await response.json()) as { success: boolean; message?: string };
            if (data.success) {
                toast.success(`Category ${!category.isActive ? "activated" : "deactivated"}`);

                fetchCategories();
                onUpdate();
            }
        } catch (error) {
            console.error("Toggle status error:", error);
            toast.error("Failed to update category status");
        }
    };

    const handleAddSubcategory = () => {
        if (!newSubcategory.trim()) return;
        if (subcategories.includes(newSubcategory.trim())) {
            toast.error("Subcategory already exists");
            return;
        }
        setSubcategories([...subcategories, newSubcategory.trim()]);
        setNewSubcategory("");
    };

    const handleRemoveSubcategory = (sub: string) => {
        setSubcategories(subcategories.filter((s) => s !== sub));
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold">Categories</h2>
                <Button onClick={handleCreate} size="sm">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Category
                </Button>
            </div>

            <Card>
                <CardContent className="pt-6">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="relative flex-1 max-w-sm">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                placeholder="Search categories..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-9"
                            />
                        </div>
                    </div>

                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Product Count</TableHead>
                                    <TableHead>Subcategories</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="w-[100px] text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <CategoryTableSkeleton />
                                ) : filteredCategories.map((cat) => (
                                    <TableRow key={cat._id}>
                                        <TableCell className="font-medium">
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    {cat.icon && <span className="text-lg">{cat.icon}</span>}
                                                    <p>{cat.name}</p>
                                                </div>
                                                <p className="text-xs text-muted-foreground font-normal">{cat.slug}</p>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="secondary">{cat.productCount} products</Badge>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-wrap gap-1">
                                                {cat.subcategories?.slice(0, 3).map((sub, idx) => {
                                                    const name = typeof sub === 'string' ? sub : sub.name;
                                                    return (
                                                        <Badge key={idx} variant="outline" className="text-xs">{name}</Badge>
                                                    );
                                                })}
                                                {(cat.subcategories?.length || 0) > 3 && (
                                                    <span className="text-xs text-muted-foreground">+{cat.subcategories!.length - 3} more</span>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Switch
                                                checked={cat.isActive}
                                                onCheckedChange={() => handleToggleStatus(cat)}
                                            />
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button variant="ghost" size="icon" onClick={() => handleEdit(cat)}>
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {!loading && filteredCategories.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                                            No categories found.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle>{editingCategory ? "Edit Category" : "Add Category"}</DialogTitle>
                        <DialogDescription>
                            {editingCategory ? "Update the details of your category" : "Create a new category for your catalog"}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4 max-h-[70vh] overflow-y-auto px-1">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="cat-name">Category Name</Label>
                                <Input
                                    id="cat-name"
                                    value={categoryName}
                                    onChange={(e) => setCategoryName(e.target.value)}
                                    placeholder="Diagnostic, Surgical, etc."
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="cat-icon">Icon (Emoji/String)</Label>
                                <Input
                                    id="cat-icon"
                                    value={icon}
                                    onChange={(e) => setIcon(e.target.value)}
                                    placeholder="🦷"
                                />
                            </div>
                        </div>

                        <div className="space-y-3 pt-2">
                            <div className="flex items-center justify-between border p-3 rounded-md">
                                <div>
                                    <Label htmlFor="cat-active" className="text-base">Active</Label>
                                    <p className="text-xs text-muted-foreground">Visible in system</p>
                                </div>
                                <Switch
                                    id="cat-active"
                                    checked={isActive}
                                    onCheckedChange={setIsActive}
                                />
                            </div>
                            <div className="flex items-center justify-between border p-3 rounded-md">
                                <div>
                                    <Label htmlFor="cat-menu" className="text-base">Show in Menu</Label>
                                    <p className="text-xs text-muted-foreground">Visible in navigation</p>
                                </div>
                                <Switch
                                    id="cat-menu"
                                    checked={showInMenu}
                                    onCheckedChange={setShowInMenu}
                                />
                            </div>
                            <div className="flex items-center justify-between border p-3 rounded-md">
                                <div>
                                    <Label htmlFor="cat-home" className="text-base">Show in Homepage</Label>
                                    <p className="text-xs text-muted-foreground">Highlighted on entry</p>
                                </div>
                                <Switch
                                    id="cat-home"
                                    checked={showInHomepage}
                                    onCheckedChange={setShowInHomepage}
                                />
                            </div>
                        </div>

                        <div className="space-y-2 pt-2">
                            <Label>Subcategories</Label>
                            <div className="flex gap-2">
                                <Input
                                    value={newSubcategory}
                                    onChange={(e) => setNewSubcategory(e.target.value)}
                                    placeholder="Add subcategory..."
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault();
                                            handleAddSubcategory();
                                        }
                                    }}
                                />
                                <Button type="button" onClick={handleAddSubcategory} size="icon">
                                    <Plus className="h-4 w-4" />
                                </Button>
                            </div>
                            <div className="flex flex-wrap gap-2 mt-2">
                                {subcategories.map((sub) => (
                                    <Badge key={sub} variant="secondary" className="pl-2 pr-1 py-1">
                                        {sub}
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveSubcategory(sub)}
                                            className="ml-1 hover:bg-destructive/20 rounded-full p-0.5"
                                        >
                                            <X className="h-3 w-3" />
                                        </button>
                                    </Badge>
                                ))}
                                {subcategories.length === 0 && (
                                    <p className="text-xs text-muted-foreground">No subcategories added.</p>
                                )}
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={saveLoading}>
                            Cancel
                        </Button>
                        <Button onClick={handleSave} disabled={saveLoading}>
                            {saveLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                            {editingCategory ? "Save Changes" : "Create Category"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
