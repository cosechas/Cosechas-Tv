"use client"

import { TrendingUp, TrendingDown } from "lucide-react"
import { Label, PolarRadiusAxis, RadialBar, RadialBarChart } from "recharts"

import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
    type ChartConfig,
} from "@/components/ui/chart"

export const description = "A radial chart comparing connected and disconnected stores"

const chartConfig = {
    conectadas: {
        label: "Conectadas",
        color: "hsl(var(--chart-2))", // Needs hsl() wrapping to be valid in svg fill
    },
    desconectadas: {
        label: "Desconectadas",
        color: "hsl(var(--chart-6))", // Needs hsl() wrapping
    },
} satisfies ChartConfig

export function ChartRadialText({ 
    conectadas = 0, 
    desconectadas = 0 
}: { 
    conectadas?: number, 
    desconectadas?: number 
} = {}) {
    const totalTiendas = conectadas + desconectadas;
    
    // Safety fallback when no stores exist to still display circles
    const safeConectadas = totalTiendas === 0 ? 0 : conectadas;
    const safeDesconectadas = totalTiendas === 0 ? 1 : desconectadas;
    
    // We put all the metrics in the same "month" object to stack them
    const chartData = [{ 
        name: "tiendas", 
        desconectadas: safeDesconectadas, 
        conectadas: safeConectadas 
    }]

    const activePercentage = totalTiendas > 0 
        ? Math.round((conectadas / totalTiendas) * 100) 
        : 0;

    return (
        <Card className="flex flex-col shadow-none border-none w-full max-w-sm">
            <CardHeader className="items-center pb-0">
                <CardTitle>Estado de Tiendas</CardTitle>
                <CardDescription>Visualización de conectividad en tiempo real</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 pb-0">
                <ChartContainer
                    config={chartConfig}
                    className="mx-auto aspect-square max-h-[250px]"
                >
                    <RadialBarChart
                        data={chartData}
                        startAngle={90}
                        endAngle={-270}
                        innerRadius={80}
                        outerRadius={110}
                    >
                        <ChartTooltip
                            cursor={false}
                            content={<ChartTooltipContent hideLabel />}
                        />
                        <PolarRadiusAxis tick={false} tickLine={false} axisLine={false}>
                            <Label
                                content={({ viewBox }) => {
                                    if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                                        return (
                                            <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle" dominantBaseline="middle">
                                                <tspan
                                                    x={viewBox.cx}
                                                    y={(viewBox.cy || 0) - 6}
                                                    className="fill-foreground text-3xl font-bold"
                                                >
                                                    {totalTiendas.toLocaleString()}
                                                </tspan>
                                                <tspan
                                                    x={viewBox.cx}
                                                    y={(viewBox.cy || 0) + 18}
                                                    className="fill-muted-foreground"
                                                >
                                                    Total Tiendas
                                                </tspan>
                                            </text>
                                        )
                                    }
                                }}
                            />
                        </PolarRadiusAxis>
                        {/* We use stackId="a" to stack them visually */}
                        {/* Gray base for disconnected */}
                        <RadialBar
                            dataKey="desconectadas"
                            stackId="a"
                            fill="var(--color-desconectadas)"
                            cornerRadius={totalTiendas === 0 ? 10 : 0}
                            className="stroke-transparent stroke-1"
                        />
                        {/* Primary color on top for connected */}
                        <RadialBar
                            dataKey="conectadas"
                            fill="var(--color-conectadas)"
                            stackId="a"
                            cornerRadius={10}
                            className="stroke-transparent stroke-1"
                        />
                    </RadialBarChart>
                </ChartContainer>
            </CardContent>
            <CardFooter className="flex-col gap-2 text-sm mt-4">
                <div className="flex items-center gap-2 leading-none font-medium text-foreground">
                    {activePercentage >= 50 ? (
                        <>Buen rendimiento: {activePercentage}% conectadas <TrendingUp className="h-4 w-4 text-green-500" /></>
                    ) : (
                        <>Ojo: {activePercentage}% conectadas <TrendingDown className="h-4 w-4 text-red-500" /></>
                    )}
                </div>
                <div className="leading-none text-muted-foreground text-center">
                    Mostrando conectividad general de la zona seleccionada
                </div>
            </CardFooter>
        </Card>
    )
}
