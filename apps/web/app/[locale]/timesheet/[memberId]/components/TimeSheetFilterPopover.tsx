import { useOrganizationTeams, useTeamTasks } from "@app/hooks";
import { Button } from "@components/ui/button";
import { statusOptions } from "@app/constants";
import { MultiSelect } from "lib/components/custom-select";
import React, { useEffect } from "react";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@components/ui/popover";
import { SettingFilterIcon } from "@/assets/svg";
import { useTranslations } from "next-intl";
import { clsxm } from "@/app/utils";



export function TimeSheetFilterPopover() {
    const [shouldRemoveItems, setShouldRemoveItems] = React.useState(false);
    const { activeTeam } = useOrganizationTeams();
    const { tasks } = useTeamTasks();
    const t = useTranslations();

    useEffect(() => {
        if (shouldRemoveItems) {
            setShouldRemoveItems(false);
        }
    }, [shouldRemoveItems]);

    return (
        <>
            <Popover>
                <PopoverTrigger asChild>
                    <Button variant="outline"
                        className='flex items-center justify-center  h-[2.2rem] rounded-lg bg-white dark:bg-dark--theme-light border dark:border-gray-700 hover:bg-white p-3 gap-2'>
                        <SettingFilterIcon className="text-gray-700 dark:text-white w-3.5" strokeWidth="1.8" />
                        <span className="text-gray-700 dark:text-white">{t('common.FILTER')}</span>
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-96">
                    <div className="w-full flex flex-col">
                        <div className="flex mb-3 text-xl font-bold gap-2">
                            <SettingFilterIcon className="text-gray-700 dark:text-white w-4" strokeWidth="1.8" />
                            <span className="text-gray-700 dark:text-white">{t('common.FILTER')}</span>
                        </div>
                        <div className="grid gap-5">
                            <div className="">
                                <label className="flex justify-between text-gray-600 mb-1 text-sm">
                                    <span className="text-[12px]">{t('manualTime.EMPLOYEE')}</span>
                                    <span className={clsxm("text-primary/10")}>Clear</span>
                                </label>
                                <MultiSelect
                                    removeItems={shouldRemoveItems}
                                    items={activeTeam?.members ?? []}
                                    itemToString={(members) => (members ? members.employee.fullName : '')}
                                    itemId={(item) => item.id}
                                    onValueChange={(selectedItems) => console.log(selectedItems)}
                                    multiSelect={true}
                                    triggerClassName="dark:border-gray-700"
                                />
                            </div>
                            <div className="">
                                <label className="flex justify-between text-gray-600 mb-1 text-sm">
                                    <span className="text-[12px]">{t('sidebar.PROJECTS')}</span>
                                    <span className={clsxm("text-primary/10")}>Clear</span>
                                </label>
                                <MultiSelect
                                    removeItems={shouldRemoveItems}
                                    items={activeTeam?.projects ?? []}
                                    itemToString={(project) => (activeTeam?.projects ? project.name! : '')}
                                    itemId={(item) => item.id}
                                    onValueChange={(selectedItems) => console.log(selectedItems)}
                                    multiSelect={true}
                                    triggerClassName="dark:border-gray-700"
                                />
                            </div>
                            <div className="">
                                <label className="flex justify-between text-gray-600 mb-1 text-sm">
                                    <span className="text-[12px]">{t('hotkeys.TASK')}</span>
                                    <span className={clsxm("text-primary/10")}>Clear</span>
                                </label>
                                <MultiSelect
                                    removeItems={shouldRemoveItems}
                                    items={tasks}
                                    onValueChange={(task) => task}
                                    itemId={(task) => (task ? task.id : '')}
                                    itemToString={(task) => (task ? task.title : '')}
                                    multiSelect={true}
                                    triggerClassName="dark:border-gray-700"
                                />
                            </div>
                            <div className="">
                                <label className="flex justify-between text-gray-600 mb-1 text-sm">
                                    <span className="text-[12px]">{t('common.STATUS')}</span>
                                    <span className={clsxm("text-primary/10")}>Clear</span>
                                </label>
                                <MultiSelect
                                    removeItems={shouldRemoveItems}
                                    items={statusOptions}
                                    itemToString={(status) => (status ? status.value : '')}
                                    itemId={(item) => item.value}
                                    onValueChange={(selectedItems) => console.log(selectedItems)}
                                    multiSelect={true}
                                    triggerClassName="dark:border-gray-700"
                                />
                            </div>
                            <div className="flex items-center justify-end gap-x-4 w-full">
                                <Button
                                    onClick={() => setShouldRemoveItems(true)}
                                    variant={'outline'}
                                    className='flex items-center text-sm justify-center h-10   rounded-lg  dark:text-gray-300' >
                                    <span className="text-sm">Clear Filter</span>
                                </Button>
                                <Button
                                    className='flex items-center text-sm justify-center h-10  rounded-lg bg-primary dark:bg-primary-light dark:text-gray-300' >
                                    <span className="text-sm">Apply Filter</span>
                                </Button>
                            </div>
                        </div>
                    </div>
                </PopoverContent>
            </Popover>
        </>
    )
}
