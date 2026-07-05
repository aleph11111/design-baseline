import * as React from "react"
import { render } from "@testing-library/react"
import { FormProvider, useForm } from "react-hook-form"
import { describe, expect, it } from "vitest"

import { FormField, FormItem, useFormField } from "@/components/ui/form"

function FormProviderWrapper({ children }: { children: React.ReactNode }) {
  const methods = useForm()
  return <FormProvider {...methods}>{children}</FormProvider>
}

function CallsUseFormField() {
  useFormField()
  return null
}

describe("useFormField", () => {
  it("throws before dereferencing context when used outside <FormField>", () => {
    expect(() =>
      render(
        <FormProviderWrapper>
          <CallsUseFormField />
        </FormProviderWrapper>
      )
    ).toThrow("useFormField should be used within <FormField>")
  })

  it("throws when used inside <FormField> but outside <FormItem>", () => {
    expect(() =>
      render(
        <FormProviderWrapper>
          <FormField name="email" render={() => <CallsUseFormField />} />
        </FormProviderWrapper>
      )
    ).toThrow("useFormField should be used within <FormItem>")
  })

  it("returns field state when used within <FormField> and <FormItem>", () => {
    let result: ReturnType<typeof useFormField> | undefined

    function CapturesFormField() {
      result = useFormField()
      return null
    }

    render(
      <FormProviderWrapper>
        <FormField
          name="email"
          render={() => (
            <FormItem>
              <CapturesFormField />
            </FormItem>
          )}
        />
      </FormProviderWrapper>
    )

    expect(result?.name).toBe("email")
    expect(typeof result?.id).toBe("string")
  })
})
