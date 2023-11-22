interface CardProps {
    children: string | JSX.Element | JSX.Element[],
    className ?: string
}

interface CardTitleProps {
    children: string
}

interface CardSimpleProps {
    title: string
    value: number | undefined
    type:  string
    state: string
}

interface ListCardProps {
    icon: any
    title: string
    value: number | undefined
    type:  string
    state: string
}

const Card = ({ children, className }:CardProps) => {
    return (
        <div className={ `rounded-[28px] bg-white px-4 py-6 ${className}`}>
            { children }
        </div>
    )
}

const CardTitle = ({ children }: CardTitleProps) => {
    return (
      <p className="font-bold text-xl">
        { children }
      </p>
    );
};

Card.Title = CardTitle;

export const SimpleCard = ({title, value, type, state}:CardSimpleProps) => {
    return (
        <div className="w-full px-3 py-4">
            <span className="uppercase font-medium text-gray-400 text-sm">{ title }</span>
            <div className="flex items-end space-x-2">
                <p className="font-bold text-5xl -ml-[3px]">{ value }</p>
                <span>{ type }</span>
            </div>
            <p className="text-gray-700 mt-1">{ state }</p>
        </div>
    )
}

export const ListCard = ({ icon, title, value, type, state }: ListCardProps) => {
    return (
        <div className="w-full flex items-center justify-between space-x-2 last:border-none  border-b border-gray-100 py-4">
            <div className="flex space-x-6 items-center">
                <img src={icon} className="opacity-90 w-8 ml-2" />
                <div className="flex flex-col space-y">
                    <p className="text-lg">{ title }</p>
                    <span>{ state }</span>
                </div>
            </div>
            <div className="flex justify-start">
                <div className="flex items-end space-x-2">
                    <p className="font-bold text-3xl">{ value }</p>
                    <span>{ type }</span>
                </div>
            </div>
        </div>
    )
}

export default Card;
