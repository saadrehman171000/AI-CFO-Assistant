"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Plus, Building2, MapPin, Trash2, CheckCircle } from 'lucide-react'
import { useToast } from "@/hooks/use-toast"

interface Branch {
  id?: string
  name: string
  location: string
  address?: string
  phone?: string
  description?: string
}

interface CompanyData {
  name: string
  description: string
  industry: string
  website: string
  phone: string
  address: string
}

export default function CompanySetupWizard() {
  const router = useRouter()
  const { toast } = useToast()
  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(false)
  
  const [companyData, setCompanyData] = useState<CompanyData>({
    name: '',
    description: '',
    industry: '',
    website: '',
    phone: '',
    address: '',
  })
  
  const [branches, setBranches] = useState<Branch[]>([
    { name: '', location: '', address: '', phone: '', description: '' }
  ])

  const addBranch = () => {
    setBranches([...branches, { name: '', location: '', address: '', phone: '', description: '' }])
  }

  const removeBranch = (index: number) => {
    if (branches.length > 1) {
      setBranches(branches.filter((_, i) => i !== index))
    }
  }

  const updateBranch = (index: number, field: keyof Branch, value: string) => {
    const updatedBranches = [...branches]
    updatedBranches[index] = { ...updatedBranches[index], [field]: value }
    setBranches(updatedBranches)
  }

  const validateStep1 = () => {
    return companyData.name.trim() !== ''
  }

  const validateStep2 = () => {
    return branches.every(branch => branch.name.trim() !== '' && branch.location.trim() !== '')
  }

  const handleNext = () => {
    if (currentStep === 1 && validateStep1()) {
      setCurrentStep(2)
    } else if (currentStep === 2 && validateStep2()) {
      setCurrentStep(3)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = async () => {
    setLoading(true)
    
    try {
      // Create company
      const companyResponse = await fetch('/api/company', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(companyData),
      })

      if (!companyResponse.ok) {
        throw new Error('Failed to create company')
      }

      // Create branches
      for (const branch of branches) {
        if (branch.name.trim() && branch.location.trim()) {
          const branchResponse = await fetch('/api/company/branches', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(branch),
          })

          if (!branchResponse.ok) {
            console.error('Failed to create branch:', branch.name)
          }
        }
      }

      toast({
        title: "Setup Complete!",
        description: "Your company and branches have been created successfully.",
      })

      // Redirect to dashboard
      router.push('/dashboard')

    } catch (error) {
      console.error('Setup error:', error)
      toast({
        title: "Setup Failed",
        description: "There was an error setting up your company. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Progress Steps */}
      <div className="flex items-center justify-center space-x-4 mb-8">
        {[1, 2, 3].map((step) => (
          <div key={step} className="flex items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              currentStep >= step 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200 text-gray-600'
            }`}>
              {step}
            </div>
            {step < 3 && (
              <div className={`w-12 h-1 mx-2 ${
                currentStep > step ? 'bg-blue-600' : 'bg-gray-200'
              }`} />
            )}
          </div>
        ))}
      </div>

      {/* Step 1: Company Information */}
      {currentStep === 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Company Information
            </CardTitle>
            <CardDescription>
              Tell us about your company to get started
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="companyName">Company Name *</Label>
                <Input
                  id="companyName"
                  value={companyData.name}
                  onChange={(e) => setCompanyData({...companyData, name: e.target.value})}
                  placeholder="Acme Corp"
                />
              </div>
              <div>
                <Label htmlFor="industry">Industry</Label>
                <Input
                  id="industry"
                  value={companyData.industry}
                  onChange={(e) => setCompanyData({...companyData, industry: e.target.value})}
                  placeholder="Technology, Retail, etc."
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={companyData.description}
                onChange={(e) => setCompanyData({...companyData, description: e.target.value})}
                placeholder="Brief description of your company..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  value={companyData.website}
                  onChange={(e) => setCompanyData({...companyData, website: e.target.value})}
                  placeholder="https://www.company.com"
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={companyData.phone}
                  onChange={(e) => setCompanyData({...companyData, phone: e.target.value})}
                  placeholder="+1 (555) 123-4567"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="address">Address</Label>
              <Textarea
                id="address"
                value={companyData.address}
                onChange={(e) => setCompanyData({...companyData, address: e.target.value})}
                placeholder="123 Main St, City, State, ZIP"
                rows={2}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Branch Setup */}
      {currentStep === 2 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Branch Locations
            </CardTitle>
            <CardDescription>
              Add your company branches or locations
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {branches.map((branch, index) => (
              <div key={index} className="border rounded-lg p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <Badge variant="secondary">Branch {index + 1}</Badge>
                  {branches.length > 1 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeBranch(index)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor={`branchName-${index}`}>Branch Name *</Label>
                    <Input
                      id={`branchName-${index}`}
                      value={branch.name}
                      onChange={(e) => updateBranch(index, 'name', e.target.value)}
                      placeholder="Main Office, Downtown Store, etc."
                    />
                  </div>
                  <div>
                    <Label htmlFor={`branchLocation-${index}`}>Location *</Label>
                    <Input
                      id={`branchLocation-${index}`}
                      value={branch.location}
                      onChange={(e) => updateBranch(index, 'location', e.target.value)}
                      placeholder="New York, NY"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor={`branchPhone-${index}`}>Phone</Label>
                    <Input
                      id={`branchPhone-${index}`}
                      value={branch.phone}
                      onChange={(e) => updateBranch(index, 'phone', e.target.value)}
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>
                  <div>
                    <Label htmlFor={`branchDescription-${index}`}>Description</Label>
                    <Input
                      id={`branchDescription-${index}`}
                      value={branch.description}
                      onChange={(e) => updateBranch(index, 'description', e.target.value)}
                      placeholder="Brief description..."
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor={`branchAddress-${index}`}>Address</Label>
                  <Textarea
                    id={`branchAddress-${index}`}
                    value={branch.address}
                    onChange={(e) => updateBranch(index, 'address', e.target.value)}
                    placeholder="123 Main St, City, State, ZIP"
                    rows={2}
                  />
                </div>
              </div>
            ))}

            <Button
              type="button"
              variant="outline"
              onClick={addBranch}
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Another Branch
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Review */}
      {currentStep === 3 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              Review & Confirm
            </CardTitle>
            <CardDescription>
              Review your company and branch information before completing setup
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="font-semibold text-lg mb-3">Company Information</h3>
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <p><strong>Name:</strong> {companyData.name}</p>
                {companyData.industry && <p><strong>Industry:</strong> {companyData.industry}</p>}
                {companyData.description && <p><strong>Description:</strong> {companyData.description}</p>}
                {companyData.website && <p><strong>Website:</strong> {companyData.website}</p>}
                {companyData.phone && <p><strong>Phone:</strong> {companyData.phone}</p>}
                {companyData.address && <p><strong>Address:</strong> {companyData.address}</p>}
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-3">Branches ({branches.length})</h3>
              <div className="space-y-3">
                {branches.map((branch, index) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-4">
                    <p><strong>{branch.name}</strong> - {branch.location}</p>
                    {branch.phone && <p>Phone: {branch.phone}</p>}
                    {branch.address && <p>Address: {branch.address}</p>}
                    {branch.description && <p>Description: {branch.description}</p>}
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Navigation Buttons */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={currentStep === 1}
        >
          Previous
        </Button>

        {currentStep < 3 ? (
          <Button
            onClick={handleNext}
            disabled={
              (currentStep === 1 && !validateStep1()) ||
              (currentStep === 2 && !validateStep2())
            }
          >
            Next
          </Button>
        ) : (
          <Button
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? 'Setting up...' : 'Complete Setup'}
          </Button>
        )}
      </div>
    </div>
  )
}