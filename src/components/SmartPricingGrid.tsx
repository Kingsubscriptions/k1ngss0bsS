import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Plus, 
  Minus, 
  RotateCcw, 
  Settings, 
  Calculator,
  TrendingUp,
  DollarSign,
  Trash2
} from 'lucide-react';
import { PlanOption, PlanDuration } from '@/data/products';

interface SmartPricingGridProps {
  plans: PlanOption[];
  onChange: (plans: PlanOption[]) => void;
}

interface BasePrices {
  original: number;
  sale: number;
}

interface DurationCalculation {
  duration: string;
  multiplier: number;
  isStandard: boolean;
}

const STANDARD_DURATIONS: DurationCalculation[] = [
  { duration: '1 Month', multiplier: 1, isStandard: true },
  { duration: '3 Months', multiplier: 3, isStandard: true },
  { duration: '6 Months', multiplier: 6, isStandard: true },
  { duration: '1 Year', multiplier: 12, isStandard: true }
];

export const SmartPricingGrid: React.FC<SmartPricingGridProps> = ({ plans, onChange }) => {
  const [selectedPlanIndex, setSelectedPlanIndex] = useState(0);
  const [basePrices, setBasePrices] = useState<Record<number, BasePrices>>({});
  const [customDurations, setCustomDurations] = useState<Record<number, DurationCalculation[]>>({});

  // Initialize base prices and custom durations from existing plans
  useEffect(() => {
    const newBasePrices: Record<number, BasePrices> = {};
    const newCustomDurations: Record<number, DurationCalculation[]> = {};

    plans.forEach((plan, planIndex) => {
      // Try to detect base prices from 1 Month duration
      const oneMonthDuration = plan.durations.find(d => d.duration === '1 Month');
      if (oneMonthDuration) {
        newBasePrices[planIndex] = {
          original: oneMonthDuration.original || 0,
          sale: oneMonthDuration.price || 0
        };
      } else {
        newBasePrices[planIndex] = { original: 0, sale: 0 };
      }

      // Store all durations including custom ones
      const allDurations = plan.durations.map(d => {
        const standardDuration = STANDARD_DURATIONS.find(sd => sd.duration === d.duration);
        return {
          duration: d.duration,
          multiplier: standardDuration?.multiplier || 1,
          isStandard: !!standardDuration
        };
      });

      newCustomDurations[planIndex] = allDurations;
    });

    setBasePrices(newBasePrices);
    setCustomDurations(newCustomDurations);
  }, [plans]);

  const updateBasePrices = (planIndex: number, newBasePrices: BasePrices) => {
    setBasePrices(prev => ({
      ...prev,
      [planIndex]: newBasePrices
    }));

    // Auto-recalculate all durations for this plan
    recalculateAllDurations(planIndex, newBasePrices);
  };

  const recalculateAllDurations = (planIndex: number, basePrice: BasePrices) => {
    const plan = plans[planIndex];
    if (!plan) return;

    const updatedDurations = plan.durations.map(duration => {
      const durationCalc = customDurations[planIndex]?.find(d => d.duration === duration.duration);
      const multiplier = durationCalc?.multiplier || 1;

      // Only auto-calculate if it's not a custom override
      const isCustomPrice = hasCustomPrice(planIndex, duration.duration);
      
      return {
        ...duration,
        price: isCustomPrice ? duration.price : basePrice.sale * multiplier,
        original: isCustomPrice ? duration.original : basePrice.original * multiplier
      };
    });

    const updatedPlans = [...plans];
    updatedPlans[planIndex] = {
      ...plan,
      durations: updatedDurations
    };

    onChange(updatedPlans);
  };

  const hasCustomPrice = (planIndex: number, durationName: string): boolean => {
    const plan = plans[planIndex];
    const duration = plan?.durations.find(d => d.duration === durationName);
    const basePrice = basePrices[planIndex];
    
    if (!duration || !basePrice) return false;

    const durationCalc = customDurations[planIndex]?.find(d => d.duration === durationName);
    const multiplier = durationCalc?.multiplier || 1;
    
    const expectedPrice = basePrice.sale * multiplier;
    const expectedOriginal = basePrice.original * multiplier;

    return Math.abs(duration.price - expectedPrice) > 0.01 || 
           Math.abs((duration.original || 0) - expectedOriginal) > 0.01;
  };

  const updateDurationPrice = (planIndex: number, durationIndex: number, field: 'price' | 'original', value: number) => {
    const updatedPlans = [...plans];
    const duration = { ...updatedPlans[planIndex].durations[durationIndex] };
    
    if (field === 'price') {
      duration.price = value;
    } else {
      duration.original = value;
    }

    updatedPlans[planIndex].durations[durationIndex] = duration;
    onChange(updatedPlans);
  };

  const resetToAutoCalculated = (planIndex: number, durationName: string) => {
    const basePrice = basePrices[planIndex];
    if (!basePrice) return;

    const durationCalc = customDurations[planIndex]?.find(d => d.duration === durationName);
    const multiplier = durationCalc?.multiplier || 1;

    const updatedPlans = [...plans];
    const plan = updatedPlans[planIndex];
    const durationIndex = plan.durations.findIndex(d => d.duration === durationName);

    if (durationIndex !== -1) {
      plan.durations[durationIndex] = {
        ...plan.durations[durationIndex],
        price: basePrice.sale * multiplier,
        original: basePrice.original * multiplier
      };

      onChange(updatedPlans);
    }
  };

  const addCustomDuration = (planIndex: number) => {
    const customName = prompt('Enter custom duration name (e.g., "2 Months", "18 Months"):');
    if (!customName) return;

    const multiplierStr = prompt('Enter multiplier (e.g., 2 for 2 months, 18 for 18 months):');
    const multiplier = parseFloat(multiplierStr || '1');

    if (isNaN(multiplier) || multiplier <= 0) {
      alert('Please enter a valid multiplier');
      return;
    }

    const basePrice = basePrices[planIndex];
    if (!basePrice) return;

    // Add to custom durations
    setCustomDurations(prev => ({
      ...prev,
      [planIndex]: [
        ...(prev[planIndex] || []),
        { duration: customName, multiplier, isStandard: false }
      ]
    }));

    // Add to plan durations
    const updatedPlans = [...plans];
    updatedPlans[planIndex].durations.push({
      duration: customName,
      price: basePrice.sale * multiplier,
      original: basePrice.original * multiplier
    });

    onChange(updatedPlans);
  };

  const removeDuration = (planIndex: number, durationIndex: number) => {
    const updatedPlans = [...plans];
    const removedDuration = updatedPlans[planIndex].durations[durationIndex];
    
    // Remove from plan
    updatedPlans[planIndex].durations.splice(durationIndex, 1);
    
    // Remove from custom durations if it's custom
    setCustomDurations(prev => ({
      ...prev,
      [planIndex]: prev[planIndex]?.filter(d => d.duration !== removedDuration.duration) || []
    }));

    onChange(updatedPlans);
  };

  const calculateSavings = (original: number, sale: number): number => {
    return Math.max(0, original - sale);
  };

  if (plans.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <Calculator className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No plans available. Add a plan first to use Smart Pricing.</p>
        </CardContent>
      </Card>
    );
  }

  const selectedPlan = plans[selectedPlanIndex];
  const selectedBasePrices = basePrices[selectedPlanIndex] || { original: 0, sale: 0 };

  return (
    <div className="space-y-6">
      {/* Plan Selector */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="w-5 h-5" />
            Smart Pricing Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2 mb-4">
            {plans.map((plan, index) => (
              <Button
                key={index}
                variant={selectedPlanIndex === index ? "default" : "outline"}
                onClick={() => setSelectedPlanIndex(index)}
                className="flex items-center gap-2"
              >
                <Settings className="w-4 h-4" />
                {plan.type}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Base Prices Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            Base Monthly Prices - {selectedPlan.type}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Base Original Price (Monthly) ₹</Label>
              <Input
                type="number"
                min="0"
                value={selectedBasePrices.original}
                onChange={(e) => updateBasePrices(selectedPlanIndex, {
                  ...selectedBasePrices,
                  original: parseFloat(e.target.value) || 0
                })}
                placeholder="Enter original monthly price"
              />
            </div>
            <div className="space-y-2">
              <Label>Base Sale Price (Monthly) ₹</Label>
              <Input
                type="number"
                min="0"
                value={selectedBasePrices.sale}
                onChange={(e) => updateBasePrices(selectedPlanIndex, {
                  ...selectedBasePrices,
                  sale: parseFloat(e.target.value) || 0
                })}
                placeholder="Enter sale monthly price"
              />
            </div>
          </div>
          
          {selectedBasePrices.original > 0 && selectedBasePrices.sale > 0 && (
            <Alert className="mt-4">
              <TrendingUp className="w-4 h-4" />
              <AlertDescription>
                Monthly savings: ₹{calculateSavings(selectedBasePrices.original, selectedBasePrices.sale)} 
                ({(((selectedBasePrices.original - selectedBasePrices.sale) / selectedBasePrices.original) * 100).toFixed(1)}% off)
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Duration Pricing Grid */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Calculator className="w-5 h-5" />
            Duration Pricing Grid - {selectedPlan.type}
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={() => addCustomDuration(selectedPlanIndex)}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Custom Duration
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Duration</TableHead>
                <TableHead>Original Price ₹</TableHead>
                <TableHead>Sale Price ₹</TableHead>
                <TableHead>Savings ₹</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {selectedPlan.durations.map((duration, durationIndex) => {
                const isCustom = hasCustomPrice(selectedPlanIndex, duration.duration);
                const savings = calculateSavings(duration.original || 0, duration.price);
                const savingsPercent = duration.original 
                  ? (((duration.original - duration.price) / duration.original) * 100).toFixed(1)
                  : '0';

                return (
                  <TableRow key={durationIndex}>
                    <TableCell className="font-medium">
                      {duration.duration}
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        min="0"
                        value={duration.original || ''}
                        onChange={(e) => updateDurationPrice(
                          selectedPlanIndex, 
                          durationIndex, 
                          'original', 
                          parseFloat(e.target.value) || 0
                        )}
                        className={isCustom ? 'border-blue-500 bg-blue-50' : 'bg-gray-50'}
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        min="0"
                        value={duration.price}
                        onChange={(e) => updateDurationPrice(
                          selectedPlanIndex, 
                          durationIndex, 
                          'price', 
                          parseFloat(e.target.value) || 0
                        )}
                        className={isCustom ? 'border-blue-500 bg-blue-50' : 'bg-gray-50'}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-green-600">₹{savings}</span>
                        <Badge variant="secondary" className="text-xs">
                          {savingsPercent}% off
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      {isCustom ? (
                        <Badge variant="default" className="flex items-center gap-1">
                          <Settings className="w-3 h-3" />
                          Custom
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="flex items-center gap-1">
                          <Calculator className="w-3 h-3" />
                          Auto
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {isCustom && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => resetToAutoCalculated(selectedPlanIndex, duration.duration)}
                            title="Reset to auto-calculated price"
                          >
                            <RotateCcw className="w-4 h-4" />
                          </Button>
                        )}
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => removeDuration(selectedPlanIndex, durationIndex)}
                          title="Remove this duration"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};