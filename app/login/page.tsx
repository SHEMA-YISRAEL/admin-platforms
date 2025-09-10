'use client'

import { Button } from "@heroui/react"
import { useForm, SubmitHandler } from "react-hook-form"

type Inputs = {
  userName: string
  password: string
}

export default function Page () {

    const errorFieldRequired = "Este campo es requerido"
    const {
        register,
        handleSubmit,
        watch,
        formState: { errors },
    } = useForm<Inputs>()
    const onSubmit: SubmitHandler<Inputs> = (data) => console.log(data)


    return(<>
        <div className="flex h-screen w-screen items-center justify-center bg-gray-100">
            <form className="w-1/5" onSubmit={handleSubmit(onSubmit)}>
                
                <div className="flex flex-col border rounded-md p-3 m-5 gap-3">
                    <div>
                        <label htmlFor="userName">Usuario</label>
                        <input  className="border rounded-md w-full" defaultValue="" {...register("userName", { required: true })} />
                        {errors.userName && <span className="text-xs text-red-500">{errorFieldRequired}</span>}
                    </div>
                
                
                    <div>
                        <label htmlFor="password">Contraseña :</label>
                        <input  className="border rounded-md w-full" type="password" {...register("password", { required: true })} />
                        {errors.password && <span className="text-xs text-red-500">{errorFieldRequired}</span>}
                    </div>
                    <Button className="mt-2" color="secondary" type="submit">INICIAR SESION</Button>    
                </div>
                
            </form>
        </div>
    </>)
}