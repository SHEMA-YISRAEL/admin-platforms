interface LessonComponentProps {
    params: Promise<{ slug: string }>
}
 
const LessonComponent: React.FC<LessonComponentProps> = async ({ params }) => {

    const { slug } = await params

    return (
        <>
             <div>My Post: {slug}</div>

        </>
    );
}
 
export default LessonComponent;