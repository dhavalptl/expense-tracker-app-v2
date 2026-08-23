import { useMemo, useState } from 'react'

import { createFileRoute, useRouter } from '@tanstack/react-router'

import { Button } from '#/components/ui/button.tsx'
import { Input } from '#/components/ui/input.tsx'
import { Label } from '#/components/ui/label.tsx'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '#/components/ui/select.tsx'
import { Textarea } from '#/components/ui/textarea.tsx'
import { formatInr, parseInrToPaise } from '#/lib/money.ts'
import { listMyCategories } from '#/server/categories/categories.functions.ts'
import {
  createExpenseFn,
  createIncomeFn,
} from '#/server/transactions/transactions.functions.ts'

export const Route = createFileRoute('/_authenticated/add')({
  loader: () => listMyCategories(),
  component: AddPage,
})

function todayIsoDate() {
  const now = new Date()
  const yyyy = now.getFullYear()
  const mm = String(now.getMonth() + 1).padStart(2, '0')
  const dd = String(now.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

function formatClientError(err: unknown): string {
  if (!(err instanceof Error)) {
    return 'Could not save transaction'
  }
  try {
    const parsed = JSON.parse(err.message) as Array<{ message?: string }>
    if (Array.isArray(parsed) && parsed[0]?.message) {
      return parsed[0].message
    }
  } catch {
    // not JSON
  }
  return err.message || 'Could not save transaction'
}

function AddPage() {
  const categories = Route.useLoaderData()
  const router = useRouter()
  const [type, setType] = useState<'expense' | 'income'>('expense')
  const [categoryId, setCategoryId] = useState('')
  const [formError, setFormError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  const defaultCategoryId = useMemo(
    () => categories.find((c) => c.name === 'Food')?.id ?? categories[0]?.id ?? '',
    [categories],
  )

  const selectedCategoryId = categoryId || defaultCategoryId

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setFormError(null)
    setPending(true)
    const formData = new FormData(event.currentTarget)
    const amount = String(formData.get('amount') ?? '')
    const date = String(formData.get('date') ?? '')
    const note = String(formData.get('note') ?? '')

    try {
      const amountPaise = parseInrToPaise(amount)
      if (type === 'expense') {
        if (!selectedCategoryId) {
          throw new Error('Category is required for expenses')
        }
        const txn = await createExpenseFn({
          data: {
            amountPaise,
            categoryId: selectedCategoryId,
            date,
            note: note || undefined,
          },
        })
        void formatInr(txn.amountPaise)
      } else {
        await createIncomeFn({
          data: {
            amountPaise,
            date,
            note: note || undefined,
          },
        })
      }
      await router.navigate({ to: '/history' })
    } catch (err) {
      setFormError(formatClientError(err))
    } finally {
      setPending(false)
    }
  }

  return (
    <section className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-xl font-semibold tracking-tight">Add</h1>
        <p className="text-sm text-muted-foreground">
          Log an expense or income in INR. Amounts are stored as paise.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <Button
          type="button"
          variant={type === 'expense' ? 'default' : 'outline'}
          onClick={() => setType('expense')}
        >
          Expense
        </Button>
        <Button
          type="button"
          variant={type === 'income' ? 'default' : 'outline'}
          onClick={() => setType('income')}
        >
          Income
        </Button>
      </div>

      <form className="space-y-4" method="post" onSubmit={onSubmit}>
        <div className="space-y-2">
          <Label htmlFor="amount">Amount (₹)</Label>
          <Input
            id="amount"
            name="amount"
            inputMode="decimal"
            placeholder="0.00"
            required
          />
        </div>

        {type === 'expense' ? (
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select
              value={selectedCategoryId}
              onValueChange={(value) => setCategoryId(value ?? '')}
            >
              <SelectTrigger id="category" className="w-full">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ) : null}

        <div className="space-y-2">
          <Label htmlFor="date">Date</Label>
          <Input id="date" name="date" type="date" defaultValue={todayIsoDate()} required />
        </div>

        <div className="space-y-2">
          <Label htmlFor="note">Note (optional)</Label>
          <Textarea id="note" name="note" rows={3} />
        </div>

        {formError ? (
          <p className="text-sm text-destructive" role="alert">
            {formError}
          </p>
        ) : null}

        <Button type="submit" className="w-full" disabled={pending}>
          {pending ? 'Saving…' : `Save ${type}`}
        </Button>
      </form>
    </section>
  )
}
