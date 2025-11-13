// interface DashBoardPageProps {
    
// }
 
const DashBoardPage = () => {
    return (
        <div className="h-screen flex flex-col">
            <div className="text-4xl font-bold text-center py-5">Panel de control</div>
            <div className="flex-1 grid grid-cols-2 grid-rows-2 gap-4 p-4">
                <div className="bg-blue-100 border-2 border-blue-300 rounded-lg flex items-center justify-center text-2xl">1</div>
                <div className="bg-green-100 border-2 border-green-300 rounded-lg flex items-center justify-center text-2xl">2</div>
                <div className="bg-yellow-100 border-2 border-yellow-300 rounded-lg flex items-center justify-center text-2xl">3</div>
                <div className="bg-red-100 border-2 border-red-300 rounded-lg flex items-center justify-center text-2xl">4</div>
            </div>
        </div>
    );
}
 
export default DashBoardPage;