import BugIcon from "@components/ui/svgs/bug";
import Image from 'next/image';
import VerticalThreeDot from "@components/ui/svgs/vertical-three-dot";
import { DraggableProvided } from "react-beautiful-dnd";
import CircularProgress from "@components/ui/svgs/circular-progress";
import PriorityIcon from "@components/ui/svgs/priority-icon";

function getStyle(provided: DraggableProvided, style: any) {
    if (!style) {
      return provided.draggableProps.style;
    }
  
    return {
      ...provided.draggableProps.style,
      ...style,
    };
}

function setCommentIconColor(commentType: "tagged" | "untagged") {

    let style;

    if(commentType === "tagged"){
        style = {
            backgroundColor: '#D95F5F'
        }
    }else if(commentType === "untagged"){
        style = {
            backgroundColor: '#27AE60'
        }
    } else {
        style = {

        }
    }

    return style
}

function Tag({title, backgroundColor, color}: {
    title: string,
    backgroundColor: string,
    color: string
}) {

    return (
        <>
            <div 
                className="flex flex-row gap-2 items-center py-1 px-2.5 rounded-xl"
                style={{
                    backgroundColor: `${backgroundColor}`
                }}
            >
               
                <p 
                    className={`text-xs `}
                    style={{
                        color: `${color}`
                    }}
                >{title}</p>
            </div>
        </>
    )
}

function TagList({tags}: {
    tags: any[]
}){
    return (
        <>
            <div className="flex flex-row flex-wrap gap-1 items-center">
                {tags.map((tag: any, index: number)=> {
                    return (
                        <Tag 
                            key={index}
                            title={tag.title} 
                            backgroundColor={tag.backgroundColor} 
                            color={tag.color}
                        />
                    )
                })}
            </div>
        </>
    )
}


const stackImages = (index: number, length: number) => {
    const imageRadius = 20;
    
    const total_length = ((length+1) * imageRadius);
   
    return {
        zIndex: (index+1).toString(),
        right:  `calc(${total_length -(imageRadius * (index + 2))}px)`
    }
}

function Priority({
    level
}: {
    level: number
}) {

    const numberArray = Array.from({ length: level }, (_, index) => index + 1);

    return(
        <>
            <div className="flex flex-col">
                {numberArray.map((item: any, index: number)=> {
                    return (
                        <PriorityIcon key={index}/>
                    )
                })}
            </div>
        </>
    )
}

/**
 * card that represent each task
 * @param props 
 * @returns 
 */
export default function Item(props: any) {   

    const {
      item,
      isDragging,
      isGroupedOver,
      provided,
      style,
      isClone,
      index,
    } = props;
   
    return (
      <section
        href={``}
        isDragging={isDragging}
        isGroupedOver={isGroupedOver}
        isClone={isClone}
        ref={provided.innerRef}
        {...provided.draggableProps}
        {...provided.dragHandleProps}
        style={getStyle(provided, style)}
        className="flex flex-col rounded-2xl bg-white dark:bg-dark--theme-light p-4 relative"
        data-is-dragging={isDragging}
        data-testid={item.id}
        data-index={index}
        aria-label={`${item.status.name} ${item.content}`}
      >
        <div className="flex gap-1.5 border-b border-b-gray-200 pb-4">
            <div className="flex flex-col gap-5 grow">
                <TagList tags={item.tags}/>
                <div className="flex flex-row flex-wrap items-center text-sm not-italic font-semibold">
                    <span className="bg-indianRed rounded p-1 mr-1">
                        <BugIcon/>
                    </span>
                    <span className="text-grey text-normal mr-1">#213</span>
                    <span className="text-black dark:text-white text-normal capitalize mr-2">{item.content}</span>
                    <Priority level={1}/>
                </div>
            </div>
            <div className="flex flex-col justify-between w-[48px] items-end">
                <VerticalThreeDot/>

                <CircularProgress percentage={10}/>
            </div>
        </div>
        <div className="flex flex-row justify-between items-center pt-4">
            <div className="flex flex-row items-center gap-2">
                <small className="text-grey text-xs text-normal">Worked:</small>
                <p className="text-black dark:text-white font-medium text-sm">0 h 0 m </p>
            </div>
            <div className="relative">
                <div className="w-10 flex flex-row justify-end items-center relative bg-primary">
                {images.map((image: any, index: number)=> {
                    return (
                        <Image 
                            key={index}
                            src={image.url} 
                            alt={""} 
                            height={40} 
                            width={40} 
                            className="absolute rounded-full border-2 border-white"
                            style={stackImages(index, images.length)}
                        />
                    )
                })}
               </div>
            </div>
        </div>
        {item.hasComment !== "none" &&
            (<div className="flex flex-row items-center justify-center rounded-full w-5 h-5 z-10 bg-[#e5e7eb] dark:bg-[#181920] absolute top-0 right-0">
                <div 
                    className="w-3.5 h-3.5 rounded-full"
                    style={setCommentIconColor(item.hasComment)}
                >
                </div>
            </div>)
        }
      </section>
    );
}

const images = [
    {
        id: 0,
        url: '/assets/cover/auth-bg-cover-dark.png'
    },
    {
        id: 1,
        url: '/assets/cover/auth-bg-cover-dark.png'
    },
    {
        id: 2,
        url: '/assets/cover/auth-bg-cover-dark.png'
    },
    {
        id: 3,
        url: '/assets/cover/auth-bg-cover-dark.png'
    },
    {
        id: 4,
        url: '/assets/cover/auth-bg-cover-dark.png'
    },
]