import { KanbanTabs } from "@app/constants";
import { useOrganizationTeams } from "@app/hooks";
import { useKanban } from "@app/hooks/features/useKanban";
import { clsxm } from "@app/utils";
import KanbanBoardSkeleton from "@components/shared/skeleton/KanbanBoardSkeleton";
import VerticalLine from "@components/ui/svgs/vertificalline";
import { withAuthentication } from "lib/app/authenticator";
import { Breadcrumb, Container } from "lib/components";
import { stackImages } from "lib/components/kanban-card";
import { AddIcon } from "lib/components/svgs";
import { KanbanView } from "lib/features/team-members-kanban-view"
import { MainLayout } from "lib/layout";
import Image from 'next/image';
import { useState } from "react";

const Kanban= () => {
  
    const { data } = useKanban();
    const {activeTeam} = useOrganizationTeams();
    
    const [activeTab, setActiveTab] = useState(KanbanTabs.TODAY);

    const imageRadius = 20;
    const numberOfImagesDisplayed = 4;
    const activeTeamMembers = activeTeam?.members ? activeTeam.members : [];
    const totalLength = ((activeTeamMembers.length+1) * imageRadius);
   
    return (
        <>
        <MainLayout>
            <div className={clsxm('relative bg-white dark:bg-dark--theme pt-20 -mt-8 ')}>
                <Container>
                    <Breadcrumb paths={['Dashboard', 'Team Page']} className="text-sm" />
                    <div className="flex flex-row items-center justify-between mt-[24px]">
                        <div>
                            <h1 className="text-[35px] font-bold text-[#282048] dark:text-white">Kanban Board</h1>
                        </div>
                        <div className="flex flex-row items-center gap-[12px]">
                            <p>08:00 ( UTC +04:30 )</p>
                            <VerticalLine/>
                            <div className="relative ">
                                <div className="flex h-fit flex-row justify-end items-center relative " style={{
                                    width: `${totalLength}px`
                                }}>
                                    {activeTeamMembers.map((image: any, index: number)=> {
                                    
                                        if(index < numberOfImagesDisplayed) {
                                            return (
                                            <Image 
                                                key={index}
                                                src={image.employee.user.imageUrl} 
                                                alt={image.title} 
                                                height={imageRadius*2} 
                                                width={imageRadius*2} 
                                                className="absolute rounded-full border-2 border-white"
                                                style={stackImages(index, activeTeamMembers.length)}
                                            />)
                                        }
                                        
                                    })}
                                    {(activeTeamMembers.length > 4) && (
                                        <div className="flex flex-row text-sm text-[#282048] dark:text-white font-semibold items-center justify-center absolute h-[40px] w-[40px] rounded-full border-2 border-[#0000001a] dark:border-white bg-white dark:bg-[#191A20]" style={stackImages(4, activeTeamMembers.length)}>
                                            {activeTeamMembers.length - numberOfImagesDisplayed}+
                                        </div>
                                    )}
                                </div>
                            </div>
                            <VerticalLine/>
                            <button className="p-2 rounded-full border-2 border-[#0000001a] dark:border-white" >
                                <AddIcon width={24} height={24} className={"dark:stroke-white"}/>
                            </button>
                        </div>
                    </div>
                    <div className="relative flex flex-row justify-between items-center mt-[36px]">
                        <div className="flex flex-row">
                            <div onClick={()=> {
                                setActiveTab(KanbanTabs.TODAY)
                            }} className={`cursor-pointer pt-2.5 px-5 pb-[30px] text-base font-bold ${activeTab === KanbanTabs.TODAY ? 'border-b-[#3826A6] text-[#3826A6]': 'border-b-white dark:border-b-[#191A20] dark:text-white text-[#282048]'}`} style={{
                                borderBottomWidth: '3px',
                                borderBottomStyle: 'solid',
                            }}>
                                Today
                            </div>
                            <div onClick={()=> {
                                setActiveTab(KanbanTabs.YESTERDAY)
                            }} className={`cursor-pointer pt-2.5 px-5 pb-[30px] text-base font-bold ${activeTab === KanbanTabs.YESTERDAY ? 'border-b-[#3826A6] text-[#3826A6]': 'border-b-white dark:border-b-[#191A20] dark:text-white text-[#282048]'}`} style={{
                                borderBottomWidth: '3px',
                                borderBottomStyle: 'solid',
                            }}>
                                Yesterday
                            </div>
                            <div onClick={()=> {
                                setActiveTab(KanbanTabs.TOMORROW)
                            }} className={`cursor-pointer pt-2.5 px-5 pb-[30px] text-base font-bold ${activeTab === KanbanTabs.TOMORROW ? 'border-b-[#3826A6] text-[#3826A6]': 'border-b-white dark:border-b-[#191A20] dark:text-white text-[#282048]'}`} style={{
                                borderBottomWidth: '3px',
                                borderBottomStyle: 'solid',
                            }}>
                                Tomorrow
                            </div>
                        </div>
                        <div>

                        </div>
                    </div>
                </Container>
            </div>
            {/** Kanbanboard for today tasks */}
            {(activeTab === KanbanTabs.TODAY) && (
                <>
                {Object.keys(data).length > 0 ? 
                    <KanbanView kanbanBoardTasks={data}/>
                    :
                    <KanbanBoardSkeleton/>
                }
                </>
            )}

            {/** Kanbanboard for yesterday tasks */}
            {(activeTab === KanbanTabs.YESTERDAY) && (
                <>
                {Object.keys(data).length > 0 ? 
                    <KanbanView kanbanBoardTasks={data}/>
                    :
                    <KanbanBoardSkeleton/>
                }
                </>
            )}

            {/** Kanbanboard for tomorrow tasks */}
            {(activeTab === KanbanTabs.TOMORROW) && (
                <>
                {Object.keys(data).length > 0 ? 
                    <KanbanView kanbanBoardTasks={data}/>
                    :
                    <KanbanBoardSkeleton/>
                }
                </>
            )}
           
        </MainLayout>
        </>
    )
}

export default withAuthentication(Kanban, { displayName: 'Kanban'});
