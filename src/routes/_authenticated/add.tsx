import { useMemo, useState } from 'react'

import { useForm } from '@tanstack/react-form'
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

function AddPage() {
  const categories = Route.useLoaderData()
  const router = useRouter()
  const [type, setType] = useState<'expense' | 'income'>('expense')
  const [formError, setFormError] = useState<string | null>(null)
  const [lastSaved, setLastSaved] = useState<string | null>(null)

  const defaultCategoryId = useMemo(
    () => categories.find((c) => c.name === 'Food')?.id ?? categories[0]?.id ?? '',
    [categories],
  )

  const form = useForm({
    defaultValues: {
      amount: '',
      categoryId: defaultCategoryId,
      date: todayIsoDate(),
      note: '',
    },
    onSubmit: async ({ value }) => {
      setFormError(null)
      setLastSaved(null)
      try {
        const amountPaise = parseInrToPaise(value.amount)
        if (type === 'expense') {
          if (!value.categoryId) {
            throw new Error('Category is required for expenses')
          }
          const txn = await createExpenseFn({
            data: {
              amountPaise,
              categoryId: value.categoryId,
              date: value.date,
              note: value.note || undefined,
            },
          })
          setLastSaved(`Saved expense ${formatInr(txn.amountPaise)}`)
        } else {
          const txn = await createIncomeFn({
            data: {
              amountPaise,
              date: value.date,
              note: value.note || undefined,
            },
          })
          setLastSaved(`Saved income ${formatInr(txn.amountPaise)}`)
        }
        form.reset()
        form.setFieldValue('categoryId', defaultCategoryId)
        form.setFieldValue('date', todayIsoDate())
        await router.navigate({ to: '/history' })
      } catch (err) {
        setFormError(err instanceof Error ? err.message : 'Could not save transaction')
      }
    },
  })

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

      <form
        className="space-y-4"
        onSubmit={(event) => {
          event.preventDefault()
          event.stopPropagation()
          void form.handleSubmit()
        }}
      >
        <form.Field
          name="amount"
          children={(field) => (
            <div className="space-y-2">
              <Label htmlFor={field.name}>Amount (₹)</Label>
              <Input
                id={field.name}
                inputMode="decimal"
                placeholder="0.00"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(event) => field.handleChange(event.target.value)}
                required
              />
            </div>
          )}
        />

        {type === 'expense' ? (
          <form.Field
            name="categoryId"
            children={(field) => (
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={field.state.value}
                  onValueChange={(value) => field.handleChange(value ?? '')}
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
            )}
          />
        ) : null}

        <form.Field
          name="date"
          children={(field) => (
            <div className="space-y-2">
              <Label htmlFor={field.name}>Date</Label>
              <Input
                id={field.name}
                type="date"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(event) => field.handleChange(event.target.value)}
                required
              />
            </div>
          )}
        />

        <form.Field
          name="note"
          children={(field) => (
            <div className="space-y-2">
              <Label htmlFor={field.name}>Note (optional)</Label>
              <Textarea
                id={field.name}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(event) => field.handleChange(event.target.value)}
                rows={3}
              />
            </div>
          )}
        />

        {formError ? (
          <p className="text-sm text-destructive" role="alert">
            {formError}
          </p>
        ) : null}
        {lastSaved ? (
          <p className="text-sm text-muted-foreground" role="status">
            {lastSaved}
          </p>
        ) : null}

        <form.Subscribe
          selector={(state) => state.isSubmitting}
          children={(isSubmitting) => (
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? 'Saving…' : `Save ${type}`}
            </Button>
          )}
        />
      </form>
    </section>
  )
}
