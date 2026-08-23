import { useState } from 'react'

import { createFileRoute, useRouter } from '@tanstack/react-router'

import { Button } from '#/components/ui/button.tsx'
import { Input } from '#/components/ui/input.tsx'
import { Label } from '#/components/ui/label.tsx'
import {
  createMyCategory,
  deleteMyCategory,
  listMyCategories,
  renameMyCategory,
} from '#/server/categories/categories.functions.ts'

export const Route = createFileRoute('/_authenticated/categories')({
  loader: () => listMyCategories(),
  component: CategoriesPage,
})

function CategoriesPage() {
  const categories = Route.useLoaderData()
  const router = useRouter()
  const [name, setName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState('')

  async function refresh() {
    await router.invalidate()
  }

  async function onCreate(event: React.FormEvent) {
    event.preventDefault()
    setError(null)
    setPending(true)
    try {
      await createMyCategory({ data: { name } })
      setName('')
      await refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not create category')
    } finally {
      setPending(false)
    }
  }

  async function onRename(categoryId: string) {
    setError(null)
    setPending(true)
    try {
      await renameMyCategory({ data: { categoryId, name: editingName } })
      setEditingId(null)
      await refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not rename category')
    } finally {
      setPending(false)
    }
  }

  async function onDelete(categoryId: string) {
    setError(null)
    setPending(true)
    try {
      await deleteMyCategory({ data: { categoryId } })
      await refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not delete category')
    } finally {
      setPending(false)
    }
  }

  return (
    <section className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-xl font-semibold tracking-tight">Categories</h1>
        <p className="text-sm text-muted-foreground">
          Customize expense categories. Delete is blocked while a category is used by
          transactions.
        </p>
      </div>

      <form className="space-y-3" onSubmit={onCreate}>
        <div className="space-y-2">
          <Label htmlFor="category-name">New category</Label>
          <Input
            id="category-name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="e.g. Coffee"
            required
          />
        </div>
        <Button type="submit" disabled={pending} className="w-full">
          Add category
        </Button>
      </form>

      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}

      {categories.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No categories yet. Add one to start organizing expenses.
        </p>
      ) : (
        <ul className="space-y-3">
          {categories.map((category) => (
            <li
              key={category.id}
              className="flex flex-col gap-2 border border-border px-3 py-3"
            >
              {editingId === category.id ? (
                <div className="flex flex-col gap-2">
                  <Input
                    value={editingName}
                    onChange={(event) => setEditingName(event.target.value)}
                    aria-label={`Rename ${category.name}`}
                  />
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      size="sm"
                      disabled={pending}
                      onClick={() => onRename(category.id)}
                    >
                      Save
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => setEditingId(null)}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-medium">{category.name}</span>
                  <div className="flex gap-1">
                    <Button
                      type="button"
                      size="xs"
                      variant="outline"
                      onClick={() => {
                        setEditingId(category.id)
                        setEditingName(category.name)
                      }}
                    >
                      Rename
                    </Button>
                    <Button
                      type="button"
                      size="xs"
                      variant="destructive"
                      disabled={pending}
                      onClick={() => onDelete(category.id)}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
