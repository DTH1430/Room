'use client'
import Image from 'next/image'
import React, { useState } from 'react'
import HomeCard from './HomeCard'
import { useRouter } from 'next/navigation'
import MeetingModel from './MeetingModel'
import { useUser } from '@clerk/nextjs'
import { Call, useStreamVideoClient } from '@stream-io/video-react-sdk'
import { error } from 'console'
import { useToast } from "@/hooks/use-toast"
import { Textarea } from './ui/textarea'
import DatePicker from "react-datepicker";
import { Input } from './ui/input'



const MeetingTypeList = () => {
  const router = useRouter();
  const [meetingState, setMeetingState] = useState<'isScheduleMeeting' | 'isJoiningMeeting' | 'isInstantMeeting' | undefined> ();
  const {user} = useUser();
  const client = useStreamVideoClient();
  const [values, setValues] = useState({
    dateTime:new Date(),
    description: '',
    link:''
  });
  const [callDetail, setCallDetail] = useState<Call>();
  const {toast} = useToast();
  const createMeeting = async () =>{
        if (!client || !user) return;
        try {
          if (!values.dateTime) {
            toast({ title: 'Vui lòng chọn ngày và thời gian' });
            return;
          }
          const id = crypto.randomUUID();
          const call = client.call('default', id);

          if(!call) throw new Error('Tạo cuộc họp thất bại');
          const startsAt = values.dateTime.toISOString() || new Date(Date.now()).toISOString();
          const description = values.description || 'Cuộc họp ngay lập tức';
          
          await call.getOrCreate({
            data: {
              starts_at: startsAt,
              custom: {
                description,
              },
            },
          });
          setCallDetail(call);
          if(!values.description){
            router.push(`/meeting/${call.id}`)
          }
          toast({title: "Tạo cuộc họp thành công"})
        } catch (error) {
          console.log(error);
          toast({title: "Tạo cuộc họp thất bại"})
        }
  }

  const meetingLink = `${process.env.NEXT_PUBLIC_BASE_URL}/meeting/${callDetail?.id}`;

  return (
  <section  className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
    <HomeCard
          img = '/icons/add-meeting.svg'
          title="Cuộc họp mới"
          description = "Bắt đầu 1 cuộc họp tức thì"
          className = "bg-orange-1"
          handleClick = {()=>setMeetingState('isInstantMeeting')}
        
      />
      <HomeCard 
          img = '/icons/join-meeting.svg'
          title="Tham gia"
          description = "Thông qua link lời mời"
          className = "bg-blue-1"
          handleClick = {()=>setMeetingState('isJoiningMeeting')}/>
      <HomeCard
          img = '/icons/schedule.svg'
          title="Lên lịch"
          description = "Lên kế hoạch cuộc họp"
          className="bg-purple-1"
          handleClick = {()=>setMeetingState('isScheduleMeeting')}/>

      <HomeCard
          img = '/icons/recordings.svg'
          title="Xem bản ghi"
          description = "Bản ghi cuộc họp"
          className="bg-yellow-1"
          handleClick={() => router.push('/recordings')}/>


      {!callDetail ? (
         <MeetingModel 
         isOpen={meetingState === 'isScheduleMeeting'}
         onClose={() => setMeetingState(undefined)}
         title="Tạo cuộc họp"
         
         handleClick={createMeeting}
       >
        <div className="flex flex-col gap-2.5"> 
            <label className="text-base font-normal leading-[22.4px] text-sky-2">
              Thêm ghi chú
            </label>
            <Textarea className="border-none bg-dark-3 focus-visible:ring-0 focus-visible:ring-offset-0"
            onChange={(e) =>  setValues({ ...values, description: e.target.value })
                    }/>
        </div>
        <div className="flex w-full flex-col gap-2.5">
          <label  className="text-base font-normal leading-[22.4px] text-sky-2">
            Chọn Ngày và Thời gian
          </label>
            <DatePicker
             selected={values.dateTime}
             onChange={(date) => setValues({ ...values, dateTime: date! })}
             showTimeSelect
             timeFormat="HH:mm"
             timeIntervals={15}
             timeCaption="Thời gian"
             dateFormat="dd/MM/yyyy HH:mm a"
             className="w-full rounded bg-dark-3 p-2 focus:outline-none"
            />
        </div>
       </MeetingModel>
      ) :(
        <MeetingModel 
          isOpen={meetingState === 'isScheduleMeeting'}
          onClose={() => setMeetingState(undefined)}
          title="Cuộc họp đã được tạo"
          handleClick={() => {
            navigator.clipboard.writeText(meetingLink);
            toast({title:'Đã sao chép link'});
          }}
          image={'/icons/checked.svg'}
          buttonIcon="/icons/copy.svg"
          className="text-center"
          buttonText="Sao chép link cuộc họp"
      />
      ) }
      <MeetingModel 
        isOpen={meetingState === 'isInstantMeeting'}
        onClose={() => setMeetingState(undefined)}
        title="Bắt đầu 1 cuộc họp"
        className = "text-center"
        buttonText = "Bắt đầu"
        handleClick={createMeeting}
      />

      <MeetingModel 
        isOpen={meetingState === 'isJoiningMeeting'}
        onClose={() => setMeetingState(undefined)}
        title="Nhập link cuộc họp"
        className = "text-center"
        buttonText = "Tham gia"
        handleClick = {() => router.push(values.link)}  
      >

        <Input
         placeholder="Link cuộc họp"
         onChange={(e) => setValues({ ...values, link: e.target.value })}
         className="border-none bg-dark-3 focus-visible:ring-0 focus-visible:ring-offset-0"
        />
        </MeetingModel>

  </section>

  )
}

export default MeetingTypeList