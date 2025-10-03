'use client'

import { Button, Input} from "@heroui/react"
import { useForm, SubmitHandler } from "react-hook-form"
import { useRouter } from "next/navigation"

type Inputs = {
  userName: string
  password: string
}

export default function Page () {

    const router = useRouter()
    const errorFieldRequired = "Este campo es requerido"
    const {
        register,
        handleSubmit,
        watch,
        formState: { errors },
    } = useForm<Inputs>()
    const onSubmit: SubmitHandler<Inputs> = (data) => {
        if (data.userName === "admin" && data.password === "admin") {
            router.push("/topoquizz")
        }
    }


    return(<>
        <div className="flex h-screen w-screen items-center justify-center">
            
            <form className="w-3/5 md:w-2/5 lg:w-1/5" onSubmit={handleSubmit(onSubmit)}>
                
                <div className="flex flex-col rounded-md p-3 m-5 gap-3 ">
                    <h1 className="font-bold text-center text-3xl">ADMIN PANEL</h1>
                    <div>
                        {/* <label htmlFor="userName">Usuario</label> */}
                        <Input label="Usuario" className=" rounded-md w-full" defaultValue="" {...register("userName", { required: true })} />
                        {errors.userName && <span className="text-xs text-red-500">{errorFieldRequired}</span>}
                    </div>
                
                
                    <div>
                        {/* <label htmlFor="password">Contraseña :</label> */}
                        <Input label="Contraseña" className="rounded-md w-full" type="password" {...register("password", { required: true })} />
                        {errors.password && <span className="text-xs text-red-500">{errorFieldRequired}</span>}
                    </div>
                    <Button className="mt-2" color="secondary" type="submit">INICIAR SESION</Button>    
                </div>
                
            </form>
        </div>
    </>)
}