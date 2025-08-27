"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Plus, Building2, MapPin, Phone, Edit, Trash2, Save, X } from 'lucide-react'
import { useToast } from "@/hooks/use-toast"

interface Branch {
  id: string
  name: string
  location: string
  address?: string
  phone?: string
  description?: string
  isActive: boolean
  createdAt: string
}

interface BranchFormData {
  name: string
  location: string
  address: string
  phone: string
  description: string
}

export default function BranchManager() {
  const { toast } = useToast()
  const [branches, setBranches] = useState<Branch[]>([])
  const [loading, setLoading] = useState(true)
  const [isAddingBranch, setIsAddingBranch] = useState(false)
  const [editingBranch, setEditingBranch] = useState<string | null>(null)
  const [formData, setFormData] = useState<BranchFormData>({
    name: '',
    location: '',
    address: '',
    phone: '',
    description: '',
  })

  useEffect(() => {
    fetchBranches()
  }, [])

  const fetchBranches = async () => {
    try {
      const response = await fetch('/api/company/branches')
      if (response.ok) {
        const data = await response.json()
        setBranches(data.branches)
      }
    } catch (error) {
      console.error('Error fetching branches:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddBranch = async () => {
    if (!formData.name.trim() || !formData.location.trim()) {
      toast({
        title: "Missing Information",
        description: "Branch name and location are required.",
        variant: "destructive",
      })
      return
    }

    try {
      const response = await fetch('/api/company/branches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        const data = await response.json()
        setBranches([...branches, data.branch])
        setFormData({ name: '', location: '', address: '', phone: '', description: '' })
        setIsAddingBranch(false)
        toast({
          title: "Branch Added",
          description: "New branch has been created successfully.",
        })
      } else {
        throw new Error('Failed to create branch')
      }
    } catch (error) {
      console.error('Error adding branch:', error)
      toast({
        title: "Error",
        description: "Failed to create branch. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleEditBranch = (branch: Branch) => {
    setEditingBranch(branch.id)
    setFormData({
      name: branch.name,
      location: branch.location,
      address: branch.address || '',
      phone: branch.phone || '',
      description: branch.description || '',
    })
  }

  const handleSaveEdit = async (branchId: string) => {
    try {
      const response = await fetch(`/api/company/branches/${branchId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, isActive: true }),
      })

      if (response.ok) {
        const data = await response.json()
        setBranches(branches.map(b => b.id === branchId ? data.branch : b))
        setEditingBranch(null)
        setFormData({ name: '', location: '', address: '', phone: '', description: '' })
        toast({
          title: "Branch Updated",
          description: "Branch information has been updated successfully.",
        })
      } else {
        throw new Error('Failed to update branch')
      }
    } catch (error) {
      console.error('Error updating branch:', error)
      toast({
        title: "Error",
        description: "Failed to update branch. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleDeleteBranch = async (branchId: string) => {
    if (!confirm('Are you sure you want to delete this branch?')) {
      return
    }

    try {
      const response = await fetch(`/api/company/branches/${branchId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setBranches(branches.filter(b => b.id !== branchId))
        toast({
          title: "Branch Deleted",
          description: "Branch has been deleted successfully.",
        })
      } else {
        throw new Error('Failed to delete branch')
      }
    } catch (error) {
      console.error('Error deleting branch:', error)
      toast({
        title: "Error",
        description: "Failed to delete branch. Please try again.",
        variant: "destructive",
      })
    }
  }

  const cancelEdit = () => {
    setEditingBranch(null)
    setFormData({ name: '', location: '', address: '', phone: '', description: '' })
  }

  if (loading) {
    return <div>Loading branches...</div>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Building2 className="h-8 w-8" />
            Branch Management
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage your company branches and locations
          </p>
        </div>
        <Dialog open={isAddingBranch} onOpenChange={setIsAddingBranch}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add New Branch
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Branch</DialogTitle>
              <DialogDescription>
                Create a new branch location for your company
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Branch Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="Main Office, Store #1, etc."
                  />
                </div>
                <div>
                  <Label htmlFor="location">Location *</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                    placeholder="New York, NY"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    placeholder="Brief description"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="address">Address</Label>
                <Textarea
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                  placeholder="123 Main St, City, State, ZIP"
                  rows={3}
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsAddingBranch(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddBranch}>
                  Add Branch
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Branches Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {branches.map((branch) => (
          <Card key={branch.id} className="relative">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                {editingBranch === branch.id ? (
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="font-semibold"
                  />
                ) : (
                  <CardTitle className="text-lg">{branch.name}</CardTitle>
                )}
                <Badge variant={branch.isActive ? "default" : "secondary"}>
                  {branch.isActive ? "Active" : "Inactive"}
                </Badge>
              </div>
              
              {editingBranch === branch.id ? (
                <Input
                  value={formData.location}
                  onChange={(e) => setFormData({...formData, location: e.target.value})}
                  className="text-sm"
                />
              ) : (
                <div className="flex items-center text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4 mr-1" />
                  {branch.location}
                </div>
              )}
            </CardHeader>
            
            <CardContent className="space-y-3">
              {editingBranch === branch.id ? (
                <div className="space-y-3">
                  <div>
                    <Label className="text-xs">Phone</Label>
                    <Input
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      placeholder="Phone number"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Description</Label>
                    <Input
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      placeholder="Description"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Address</Label>
                    <Textarea
                      value={formData.address}
                      onChange={(e) => setFormData({...formData, address: e.target.value})}
                      placeholder="Full address"
                      rows={2}
                    />
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      onClick={() => handleSaveEdit(branch.id)}
                      className="flex-1"
                    >
                      <Save className="h-3 w-3 mr-1" />
                      Save
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={cancelEdit}
                      className="flex-1"
                    >
                      <X className="h-3 w-3 mr-1" />
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  {branch.phone && (
                    <div className="flex items-center text-sm">
                      <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span>{branch.phone}</span>
                    </div>
                  )}
                  
                  {branch.address && (
                    <div className="text-sm text-muted-foreground">
                      <strong>Address:</strong> {branch.address}
                    </div>
                  )}
                  
                  {branch.description && (
                    <div className="text-sm text-muted-foreground">
                      <strong>Description:</strong> {branch.description}
                    </div>
                  )}
                  
                  <div className="flex space-x-2 pt-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEditBranch(branch)}
                      className="flex-1"
                    >
                      <Edit className="h-3 w-3 mr-1" />
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDeleteBranch(branch.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {branches.length === 0 && (
        <Card>
          <CardContent className="flex items-center justify-center h-32">
            <div className="text-center">
              <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                No branches found. Add your first branch to get started.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}