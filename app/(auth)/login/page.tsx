'use client'

import { Button, Input } from "@heroui/react"
import { useForm, SubmitHandler } from "react-hook-form"
import { useState } from "react"
import { useAuth } from "@/app/hooks/useAuth"

type Inputs = {
  email: string
  password: string
}

export default function Page() {
    const { login, loading } = useAuth()
    const [loginError, setLoginError] = useState<string | null>(null)
    const errorFieldRequired = "Este campo es requerido"

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<Inputs>()

    const onSubmit: SubmitHandler<Inputs> = async (data) => {
        try {
            setLoginError(null)
            await login(data.email, data.password)
        } catch (error) {
            setLoginError(error instanceof Error ? error.message : 'Error al iniciar sesión')
        }
    }

    return (
        <div className="flex h-screen w-screen items-center justify-center">
            <form className="w-4/5 md:w-4/5 lg:w-2/5 xl:w-1/5" onSubmit={handleSubmit(onSubmit)}>
                <div className="flex flex-col rounded-md p-3 m-5 gap-3">
                    <h1 className="font-bold text-center text-3xl">ADMIN PANEL</h1>

                    {loginError && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                            {loginError}
                        </div>
                    )}

                    <div>
                        <Input
                            label="Email"
                            type="email"
                            className="rounded-md w-full"
                            defaultValue=""
                            {...register("email", {
                                required: true,
                                pattern: {
                                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                    message: "Email inválido"
                                }
                            })}
                        />
                        {errors.email && (
                            <span className="text-xs text-red-500">
                                {errors.email.message || errorFieldRequired}
                            </span>
                        )}
                    </div>

                    <div>
                        <Input
                            label="Contraseña"
                            className="rounded-md w-full"
                            type="password"
                            {...register("password", { required: true })}
                        />
                        {errors.password && (
                            <span className="text-xs text-red-500">{errorFieldRequired}</span>
                        )}
                    </div>

                    <Button
                        className="mt-2"
                        color="secondary"
                        type="submit"
                        isLoading={loading}
                        disabled={loading}
                    >
                        {loading ? "INICIANDO..." : "INICIAR SESION"}
                    </Button>
                </div>
            </form>
        </div>
    )
}